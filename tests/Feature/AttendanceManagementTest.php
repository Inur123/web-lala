<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Registration;
use App\Models\User;
use App\Services\AttendanceRoster;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_pages_and_scan_require_authentication(): void
    {
        $session = AttendanceSession::create(['name' => 'Sesi Pagi']);

        $this->get(route('admin.absensi.index'))->assertRedirect(route('login'));
        $this->postJson(route('admin.absensi.scan', $session), [
            'qr_token' => 'token-tidak-valid',
        ])->assertUnauthorized();
    }

    public function test_creating_a_session_only_adds_eligible_participants(): void
    {
        $user = User::factory()->create();
        $eligible = $this->createRegistration([
            'admin_status' => 'lolos',
            'screening_status' => 'lolos',
        ]);
        $pending = $this->createRegistration();

        $this->actingAs($user)
            ->post(route('admin.absensi.store'), [
                'name' => 'Absensi Hari Pertama',
                'description' => 'Sesi pagi.',
            ])
            ->assertRedirect(route('admin.absensi.index'));

        $session = AttendanceSession::query()->sole();

        $this->assertDatabaseHas('attendances', [
            'attendance_session_id' => $session->id,
            'registration_id' => $eligible->id,
            'status' => Attendance::STATUS_PENDING,
        ]);
        $this->assertDatabaseMissing('attendances', [
            'attendance_session_id' => $session->id,
            'registration_id' => $pending->id,
        ]);
    }

    public function test_session_fields_reject_html_and_control_characters(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('admin.absensi.index'))
            ->post(route('admin.absensi.store'), [
                'name' => '<script>alert(1)</script>',
                'description' => "Catatan\x00berbahaya",
            ])
            ->assertRedirect(route('admin.absensi.index'))
            ->assertSessionHasErrors(['name', 'description']);

        $this->assertDatabaseCount('attendance_sessions', 0);
    }

    public function test_participant_is_added_to_existing_sessions_after_passing_screening(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration([
            'admin_status' => 'lolos',
            'screening_status' => 'pending',
        ]);
        $session = AttendanceSession::create(['name' => 'Sesi Pagi']);

        $this->actingAs($user)
            ->patchJson(route('registrasi.update', $registration), [
                'stage' => 'screening',
                'status' => 'lolos',
            ])
            ->assertOk();

        $this->assertDatabaseHas('attendances', [
            'attendance_session_id' => $session->id,
            'registration_id' => $registration->id,
            'status' => Attendance::STATUS_PENDING,
        ]);
    }

    public function test_rejecting_participant_preserves_existing_attendance_history(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration([
            'admin_status' => 'lolos',
            'screening_status' => 'lolos',
        ]);
        $session = app(AttendanceRoster::class)->createSession([
            'name' => 'Sesi Pagi',
            'description' => null,
        ]);
        Attendance::query()->where('registration_id', $registration->id)->update([
            'status' => Attendance::STATUS_PRESENT,
            'scanned_at' => now(),
        ]);

        $this->actingAs($user)
            ->patchJson(route('registrasi.update', $registration), [
                'stage' => 'screening',
                'status' => 'ditolak',
            ])
            ->assertOk();

        $this->assertDatabaseHas('attendances', [
            'attendance_session_id' => $session->id,
            'registration_id' => $registration->id,
            'status' => Attendance::STATUS_PRESENT,
        ]);
    }

    public function test_scan_is_recorded_once_and_duplicate_scan_is_rejected(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration([
            'admin_status' => 'lolos',
            'screening_status' => 'lolos',
        ]);
        $session = app(AttendanceRoster::class)->createSession([
            'name' => 'Sesi Pagi',
            'description' => null,
        ]);

        $this->actingAs($user)
            ->postJson(route('admin.absensi.scan', $session), [
                'qr_token' => $registration->qr_token,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->postJson(route('admin.absensi.scan', $session), [
            'qr_token' => $registration->qr_token,
        ])
            ->assertConflict()
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('attendances', 1);
        $this->assertDatabaseHas('attendances', [
            'attendance_session_id' => $session->id,
            'registration_id' => $registration->id,
            'status' => Attendance::STATUS_PRESENT,
        ]);
    }

    public function test_scan_rejects_participant_who_has_not_passed_screening(): void
    {
        $user = User::factory()->create();
        $registration = $this->createRegistration();
        $session = AttendanceSession::create(['name' => 'Sesi Pagi']);

        $this->actingAs($user)
            ->postJson(route('admin.absensi.scan', $session), [
                'qr_token' => $registration->qr_token,
            ])
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_scan_endpoint_is_rate_limited_with_indonesian_message(): void
    {
        $user = User::factory()->create();
        $session = AttendanceSession::create(['name' => 'Sesi Pagi']);
        $this->actingAs($user);

        for ($attempt = 0; $attempt < 60; $attempt++) {
            $this->postJson(route('admin.absensi.scan', $session), [
                'qr_token' => 'lala-2026-token-tidak-ditemukan',
            ])->assertNotFound();
        }

        $this->postJson(route('admin.absensi.scan', $session), [
            'qr_token' => 'lala-2026-token-tidak-ditemukan',
        ])
            ->assertTooManyRequests()
            ->assertJsonPath(
                'message',
                'Terlalu banyak pemindaian. Tunggu sebentar lalu coba lagi.',
            );
    }

    public function test_registration_receives_a_long_unique_qr_token(): void
    {
        $first = $this->createRegistration();
        $second = $this->createRegistration();

        $this->assertStringStartsWith('lala-2026-', $first->qr_token);
        $this->assertGreaterThanOrEqual(42, strlen($first->qr_token));
        $this->assertNotSame($first->qr_token, $second->qr_token);
    }

    public function test_qr_archive_can_be_downloaded(): void
    {
        $user = User::factory()->create();
        $this->createRegistration([
            'admin_status' => 'lolos',
            'screening_status' => 'lolos',
        ]);

        $this->actingAs($user)
            ->get(route('registrasi.download-qr-all'))
            ->assertOk()
            ->assertDownload('QR_Peserta_Lolos_LATIN_LATPEL_2026.zip');
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createRegistration(array $overrides = []): Registration
    {
        return Registration::create(array_merge([
            'name' => 'Peserta Absensi',
            'gender' => 'Perempuan',
            'delegation' => 'PAC IPPNU Magetan',
            'reason' => 'Mengembangkan kemampuan kaderisasi.',
            'whatsapp' => '081234567890',
            'birth_date' => '2000-01-01',
            'email' => fake()->unique()->safeEmail(),
        ], $overrides));
    }
}
