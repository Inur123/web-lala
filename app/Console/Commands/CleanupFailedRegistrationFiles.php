<?php

namespace App\Console\Commands;

use App\Models\RegistrationFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupFailedRegistrationFiles extends Command
{
    protected $signature = 'registrations:cleanup-failed-files';

    protected $description = 'Hapus salinan lokal upload gagal yang melewati masa retensi';

    public function handle(): int
    {
        $retentionDays = max(1, (int) config('malware.failed_file_retention_days', 30));
        $deleted = 0;

        RegistrationFile::query()
            ->where('upload_status', 'failed')
            ->where('upload_attempted_at', '<=', now()->subDays($retentionDays))
            ->eachById(function (RegistrationFile $file) use (&$deleted): void {
                if (Storage::disk('local')->delete($file->r2_key)) {
                    $deleted++;
                }
            });

        if ($deleted > 0) {
            Log::warning('Salinan lokal upload registrasi gagal dibersihkan.', [
                'deleted_files' => $deleted,
            ]);
        }

        $this->info("{$deleted} berkas lokal kedaluwarsa telah dibersihkan.");

        return self::SUCCESS;
    }
}
