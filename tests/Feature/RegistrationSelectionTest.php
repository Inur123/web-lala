<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationSelectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejecting_administration_automatically_rejects_screening(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration([
            'admin_status' => 'pending',
            'screening_status' => 'pending',
        ]);

        $this->actingAs($user)
            ->patchJson(route('registrasi.update', $registration), [
                'stage' => 'admin',
                'status' => 'ditolak',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'message',
                'Administrasi ditolak dan screening otomatis ditolak.',
            );

        $registration->refresh();

        $this->assertSame('ditolak', $registration->admin_status);
        $this->assertSame('ditolak', $registration->screening_status);
        $this->assertNotNull($registration->admin_reviewed_at);
        $this->assertNotNull($registration->screening_reviewed_at);
    }

    public function test_accepting_a_previously_rejected_administration_resets_screening_to_pending(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration([
            'admin_status' => 'ditolak',
            'admin_reviewed_at' => now(),
            'screening_status' => 'ditolak',
            'screening_reviewed_at' => now(),
        ]);

        $this->actingAs($user)
            ->patchJson(route('registrasi.update', $registration), [
                'stage' => 'admin',
                'status' => 'lolos',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $registration->refresh();

        $this->assertSame('lolos', $registration->admin_status);
        $this->assertSame('pending', $registration->screening_status);
        $this->assertNull($registration->screening_reviewed_at);
    }

    public function test_screening_cannot_be_changed_unless_administration_is_accepted(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration([
            'admin_status' => 'ditolak',
            'screening_status' => 'ditolak',
        ]);

        $this->actingAs($user)
            ->patchJson(route('registrasi.update', $registration), [
                'stage' => 'screening',
                'status' => 'lolos',
            ])
            ->assertBadRequest()
            ->assertJsonPath(
                'error',
                'Peserta harus lolos administrasi terlebih dahulu.',
            );

        $this->assertSame(
            'ditolak',
            $registration->fresh()->screening_status,
        );
    }

    public function test_status_update_invalidates_the_public_registrant_cache(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration();

        $this->getJson('/api/public/registrants')
            ->assertOk()
            ->assertJsonPath('registrants.0.adminStatus', 'pending');

        $this->actingAs($user)
            ->patchJson(route('registrasi.update', $registration), [
                'stage' => 'admin',
                'status' => 'lolos',
            ])
            ->assertOk();

        $this->getJson('/api/public/registrants')
            ->assertOk()
            ->assertJsonPath('registrants.0.adminStatus', 'lolos');
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createRegistration(array $overrides = []): Registration
    {
        return Registration::create(array_merge([
            'name' => 'Peserta Seleksi',
            'gender' => 'Perempuan',
            'delegation' => 'PAC IPPNU Magetan',
            'reason' => 'Mengembangkan kemampuan kaderisasi.',
            'whatsapp' => '081234567890',
            'birth_date' => '2000-01-01',
            'email' => fake()->unique()->safeEmail(),
        ], $overrides));
    }
}
