<?php

namespace App\Jobs;

use App\Models\Registration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class UploadRegistrationFilesToR2 implements ShouldBeUnique, ShouldQueue
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
     * Hindari dua job upload berjalan untuk pendaftaran yang sama.
     */
    public int $uniqueFor = 300;

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

            if ($file->upload_status === 'uploaded') {
                continue;
            }

            if ($file->upload_attempts >= 6) {
                continue;
            }

            $file->update([
                'upload_status' => 'pending',
                'upload_attempts' => $file->upload_attempts + 1,
                'upload_error' => null,
                'upload_attempted_at' => now(),
            ]);

            if (! Storage::disk('local')->exists($path)) {
                if (Storage::disk('r2')->exists($path)) {
                    $file->update([
                        'upload_status' => 'uploaded',
                        'upload_error' => null,
                        'uploaded_at' => now(),
                    ]);

                    continue;
                }

                throw new RuntimeException('Berkas lokal untuk upload R2 tidak ditemukan.');
            }

            $stream = Storage::disk('local')->readStream($path);

            if (! is_resource($stream)) {
                throw new RuntimeException('Berkas lokal tidak dapat dibaca.');
            }

            try {
                $stored = Storage::disk('r2')->put($path, $stream, [
                    'ContentType' => $file->mime_type,
                ]);

                if (! $stored) {
                    throw new RuntimeException('Cloudflare R2 menolak upload berkas.');
                }

                $file->update([
                    'upload_status' => 'uploaded',
                    'upload_error' => null,
                    'uploaded_at' => now(),
                ]);

                Storage::disk('local')->delete($path);
            } catch (Throwable $exception) {
                Log::error('Upload berkas registrasi ke R2 gagal.', [
                    'registration_id' => $registration->id,
                    'file_id' => $file->id,
                    'exception' => $exception::class,
                ]);

                throw $exception;
            } finally {
                fclose($stream);
            }
        }
    }

    public function uniqueId(): string
    {
        return $this->registrationId;
    }

    public function failed(?Throwable $exception): void
    {
        $registration = Registration::with('files')->find($this->registrationId);

        if (! $registration) {
            return;
        }

        foreach ($registration->files->where('upload_status', '!=', 'uploaded') as $file) {
            $file->update([
                'upload_status' => 'failed',
                'upload_error' => 'Upload gagal setelah beberapa percobaan.',
                'upload_attempted_at' => now(),
            ]);
        }

        Log::critical('Upload registrasi ke R2 gagal permanen.', [
            'registration_id' => $registration->id,
            'exception' => $exception ? $exception::class : null,
        ]);
    }
}
