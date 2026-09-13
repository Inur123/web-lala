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
            $path = $file->r2_key;

            // Cek apakah file masih ada di penyimpanan lokal
            if (Storage::disk('local')->exists($path)) {
                $stream = Storage::disk('local')->readStream($path);

                if ($stream === null) {
                    throw new RuntimeException("Tidak dapat membaca stream dari file lokal: {$path}");
                }

                try {
                    $stored = Storage::disk('r2')->put($path, $stream, [
                        'ContentType' => $file->mime_type,
                    ]);

                    if (! $stored) {
                        throw new RuntimeException("Cloudflare R2 menolak upload file: {$path}");
                    }

                    // Jika sukses upload, hapus file lokal agar tidak menumpuk
                    Storage::disk('local')->delete($path);
                } catch (Throwable $e) {
                    Log::error('Gagal mengupload file registrasi ke R2', [
                        'registration_id' => $registration->id,
                        'file_path' => $path,
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
    }
}
