<?php

namespace Tests\Feature;

use App\Jobs\UploadRegistrationFilesToR2;
use App\Models\Registration;
use App\Models\RegistrationFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class RegistrationUploadRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_permanently_failed_upload_is_marked_for_recovery(): void
    {
        $file = $this->createRegistrationFile();

        (new UploadRegistrationFilesToR2($file->registration_id))
            ->failed(new RuntimeException('R2 unavailable'));

        $file->refresh();

        $this->assertSame('failed', $file->upload_status);
        $this->assertSame('Upload gagal setelah beberapa percobaan.', $file->upload_error);
        $this->assertNotNull($file->upload_attempted_at);
    }

    public function test_retry_command_requeues_failed_uploads(): void
    {
        Queue::fake();

        $file = $this->createRegistrationFile([
            'upload_status' => 'failed',
            'upload_attempts' => 3,
            'upload_error' => 'R2 unavailable',
        ]);

        $this->artisan('registrations:retry-uploads')
            ->expectsOutput('1 upload registrasi kembali dimasukkan ke antrean.')
            ->assertSuccessful();

        $file->refresh();

        $this->assertSame('pending', $file->upload_status);
        $this->assertNull($file->upload_error);
        Queue::assertPushed(
            UploadRegistrationFilesToR2::class,
            fn (UploadRegistrationFilesToR2 $job): bool => $job->registrationId === $file->registration_id,
        );
    }

    public function test_retry_command_does_not_requeue_exhausted_uploads(): void
    {
        Queue::fake();

        $this->createRegistrationFile([
            'upload_status' => 'failed',
            'upload_attempts' => 6,
            'upload_error' => 'R2 unavailable',
        ]);

        $this->artisan('registrations:retry-uploads')
            ->expectsOutput('0 upload registrasi kembali dimasukkan ke antrean.')
            ->assertSuccessful();

        Queue::assertNothingPushed();
    }

    public function test_missing_local_file_still_counts_as_an_upload_attempt(): void
    {
        Storage::fake('local');
        Storage::fake('r2');

        $file = $this->createRegistrationFile();

        try {
            (new UploadRegistrationFilesToR2($file->registration_id))->handle();
            $this->fail('Job seharusnya gagal ketika file lokal dan R2 tidak tersedia.');
        } catch (RuntimeException) {
            // Kegagalan ini diharapkan dan harus tetap menambah hitungan percobaan.
        }

        $file->refresh();

        $this->assertSame(1, $file->upload_attempts);
        $this->assertNotNull($file->upload_attempted_at);
    }

    public function test_cleanup_command_removes_only_expired_failed_local_files(): void
    {
        Storage::fake('local');

        $expired = $this->createRegistrationFile([
            'r2_key' => 'registrations/expired/file.pdf',
            'upload_status' => 'failed',
            'upload_attempted_at' => now()->subDays(31),
        ]);
        $recent = $this->createRegistrationFile([
            'r2_key' => 'registrations/recent/file.pdf',
            'upload_status' => 'failed',
            'upload_attempted_at' => now()->subDay(),
        ]);

        Storage::disk('local')->put($expired->r2_key, '%PDF-expired');
        Storage::disk('local')->put($recent->r2_key, '%PDF-recent');

        $this->artisan('registrations:cleanup-failed-files')
            ->expectsOutput('1 berkas lokal kedaluwarsa telah dibersihkan.')
            ->assertSuccessful();

        Storage::disk('local')->assertMissing($expired->r2_key);
        Storage::disk('local')->assertExists($recent->r2_key);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createRegistrationFile(array $overrides = []): RegistrationFile
    {
        $registration = Registration::create([
            'name' => 'Peserta Recovery',
            'gender' => 'Laki-laki',
            'delegation' => 'PAC IPNU Magetan',
            'reason' => 'Menguji pemulihan upload berkas.',
            'whatsapp' => '081234567890',
            'birth_date' => '2000-01-01',
            'email' => fake()->unique()->safeEmail(),
        ]);

        return RegistrationFile::create(array_merge([
            'registration_id' => $registration->id,
            'field_key' => 'essay',
            'file_name' => 'esai-karya-tulis.pdf',
            'r2_key' => "registrations/{$registration->id}/esai-karya-tulis.pdf",
            'file_size' => 100,
            'mime_type' => 'application/pdf',
        ], $overrides));
    }
}
