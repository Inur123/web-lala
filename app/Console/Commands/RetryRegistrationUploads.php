<?php

namespace App\Console\Commands;

use App\Jobs\UploadRegistrationFilesToR2;
use App\Models\RegistrationFile;
use Illuminate\Console\Command;

class RetryRegistrationUploads extends Command
{
    protected $signature = 'registrations:retry-uploads {--limit=50}';

    protected $description = 'Antrekan kembali upload registrasi yang tertunda atau gagal';

    public function handle(): int
    {
        $registrationIds = RegistrationFile::query()
            ->whereIn('upload_status', ['pending', 'failed'])
            ->where('upload_attempts', '<', 6)
            ->select('registration_id')
            ->distinct()
            ->orderBy('registration_id')
            ->limit(max(1, (int) $this->option('limit')))
            ->pluck('registration_id');

        foreach ($registrationIds as $registrationId) {
            RegistrationFile::query()
                ->where('registration_id', $registrationId)
                ->where('upload_status', 'failed')
                ->update(['upload_status' => 'pending', 'upload_error' => null]);

            UploadRegistrationFilesToR2::dispatch($registrationId);
        }

        $this->info("{$registrationIds->count()} upload registrasi kembali dimasukkan ke antrean.");

        return self::SUCCESS;
    }
}
