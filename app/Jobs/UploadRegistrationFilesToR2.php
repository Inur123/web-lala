<?php

namespace App\Jobs;

use App\Models\Registration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class UploadRegistrationFilesToR2 implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah percobaan ulang jika terjadi kegagalan.
     */
    public int $tries = 3;

    /**
     * Waktu (dalam detik) sebelum job dicoba lagi jika gagal.
     */
    public int $backoff = 30;

    /**
     * Waktu maksimal (dalam detik) job ini boleh berjalan.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $registrationId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $registration = Registration::with('files')->find($this->registrationId);

        if (! $registration) {
            return;
        }

        foreach ($registration->files as $file) {
            // Lewati file yang sudah terupload
            if ($file->upload_status === 'uploaded') {
                continue;
            }

            $path = $file->r2_key;

            // Catat percobaan upload
            $file->update([
                'upload_status' => 'pending',
                'upload_attempts' => $file->upload_attempts + 1,
                'upload_attempted_at' => now(),
                'upload_error' => null,
            ]);

            // Jika file sudah tidak ada di lokal, tandai sebagai uploaded
            // (kemungkinan sudah diupload sebelumnya tapi status belum terupdate)
            if (! Storage::disk('local')->exists($path)) {
                // Kalau memang sudah ada di R2, tandai sebagai uploaded
                if (Storage::disk('r2')->exists($path)) {
                    $file->update([
                        'upload_status' => 'uploaded',
                        'uploaded_at' => now(),
                    ]);

                    continue;
                }

                // File tidak ada di mana-mana — ini kegagalan nyata
                $errorMsg = "File tidak ditemukan di lokal maupun R2: {$path}";
                $file->update([
                    'upload_status' => 'failed',
                    'upload_error' => $errorMsg,
                ]);
                throw new RuntimeException($errorMsg);
            }

            $stream = Storage::disk('local')->readStream($path);

            if ($stream === null) {
                $errorMsg = "Tidak dapat membaca stream dari file lokal: {$path}";
                $file->update(['upload_status' => 'failed', 'upload_error' => $errorMsg]);
                throw new RuntimeException($errorMsg);
            }

            try {
                $stored = Storage::disk('r2')->put($path, $stream, [
                    'ContentType' => $file->mime_type,
                ]);

                if (! $stored) {
                    throw new RuntimeException("Cloudflare R2 menolak upload file: {$path}");
                }

                // Sukses: hapus file lokal dan tandai sebagai uploaded
                Storage::disk('local')->delete($path);
                $file->update([
                    'upload_status' => 'uploaded',
                    'uploaded_at' => now(),
                    'upload_error' => null,
                ]);
            } catch (Throwable $e) {
                $file->update([
                    'upload_status' => 'failed',
                    'upload_error' => $e->getMessage(),
                ]);

                Log::error('Gagal mengupload file registrasi ke R2', [
                    'registration_id' => $registration->id,
                    'file_path' => $path,
                    'attempt' => $file->upload_attempts,
                    'error' => $e->getMessage(),
                ]);

                throw $e; // Lempar ulang agar job di-retry
            } finally {
                if (is_resource($stream)) {
                    fclose($stream);
                }
            }
        }
    }

    /**
     * Dipanggil saat job gagal setelah semua percobaan habis.
     */
    public function failed(Throwable $exception): void
    {
        $registration = Registration::with('files')->find($this->registrationId);

        if (! $registration) {
            return;
        }

        // Tandai semua file yang masih pending sebagai failed
        foreach ($registration->files as $file) {
            if ($file->upload_status !== 'uploaded') {
                $file->update([
                    'upload_status' => 'failed',
                    'upload_error' => 'Upload gagal setelah beberapa percobaan.',
                    'upload_attempted_at' => now(),
                ]);
            }
        }

        Log::critical('Job upload R2 gagal total setelah semua percobaan', [
            'registration_id' => $this->registrationId,
            'error' => $exception->getMessage(),
        ]);
    }
}
