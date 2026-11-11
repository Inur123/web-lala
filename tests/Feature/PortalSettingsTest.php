<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\RegistrationFile;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortalSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_portal_settings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('settings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('PortalSettings/Index')
                ->where('isOpen', true),
            );
    }

    public function test_admin_can_close_registration(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('settings.update'), ['isOpen' => false])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(
            'false',
            SystemSetting::getValue('registration_open'),
        );
    }

    public function test_theme_and_account_deletion_settings_are_unavailable(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/settings/profile')->assertOk();
        $this->actingAs($user)->get('/settings/security')->assertOk();
        $this->actingAs($user)->get('/settings/appearance')->assertNotFound();
        $this->actingAs($user)->delete('/settings/profile')->assertStatus(405);
    }

    public function test_guest_cannot_reset_registrations(): void
    {
        $this->postJson(route('settings.reset-registrations'), [
            'password' => 'password123',
        ])->assertUnauthorized();
    }

    public function test_admin_cannot_reset_registrations_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret-password-123'),
        ]);

        $this->actingAs($user)
            ->postJson(route('settings.reset-registrations'), [
                'password' => 'wrong-password',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_admin_can_reset_registrations_with_correct_password_and_cleans_files(): void
    {
        Storage::fake('local');
        Storage::fake('r2');

        $user = User::factory()->create([
            'password' => Hash::make('secret-password-123'),
        ]);

        $registration = Registration::create([
            'name' => 'Peserta Uji',
            'gender' => 'Laki-laki',
            'delegation' => 'PAC Magetan',
            'reason' => 'Alasan pendaftaran peserta',
            'whatsapp' => '081234567890',
            'birth_date' => '2005-01-01',
            'email' => 'peserta.uji@example.com',
        ]);

        $localPath = 'registrations/peserta-uji--123456/foto.jpg';
        $r2Path = 'registrations/peserta-uji--123456/sertifikat.pdf';

        Storage::disk('local')->put($localPath, 'dummy image content');
        Storage::disk('r2')->put($r2Path, 'dummy pdf content');

        RegistrationFile::create([
            'registration_id' => $registration->id,
            'field_key' => 'fotoFormal',
            'file_name' => 'foto.jpg',
            'r2_key' => $localPath,
        ]);

        RegistrationFile::create([
            'registration_id' => $registration->id,
            'field_key' => 'sertifikatMakesta',
            'file_name' => 'sertifikat.pdf',
            'r2_key' => $r2Path,
        ]);

        $this->assertDatabaseCount('registrations', 1);
        $this->assertDatabaseCount('registration_files', 2);
        /** @var FilesystemAdapter $local */
        $local = Storage::disk('local');
        /** @var FilesystemAdapter $r2 */
        $r2 = Storage::disk('r2');

        $local->assertExists($localPath);
        $r2->assertExists($r2Path);

        $this->actingAs($user)
            ->postJson(route('settings.reset-registrations'), [
                'password' => 'secret-password-123',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseCount('registrations', 0);
        $this->assertDatabaseCount('registration_files', 0);
        $local->assertMissing($localPath);
        $r2->assertMissing($r2Path);
    }
}
