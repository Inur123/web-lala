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

            // Tandai bahwa proses upload sedang dicoba
            $file->update([
                'upload_status' => 'pending',
                'upload_attempts' => $file->upload_attempts + 1,
                'upload_attempted_at' => now(),
                'upload_error' => null,
            ]);

            // Cek apakah file masih ada di penyimpanan lokal
            if (! Storage::disk('local')->exists($path)) {
                // File sudah tidak ada di lokal, tandai sebagai uploaded
                $file->update(['upload_status' => 'uploaded', 'uploaded_at' => now()]);
                continue;
            }

            $stream = Storage::disk('local')->readStream($path);

            if ($stream === null || $stream === false) {
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
            if ($file->upload_status === 'pending') {
                $file->update([
                    'upload_status' => 'failed',
                    'upload_error' => $exception->getMessage(),
                ]);
            }
        }

        Log::critical('Job upload R2 gagal total setelah semua percobaan', [
            'registration_id' => $this->registrationId,
            'error' => $exception->getMessage(),
        ]);
    }
}
