<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Registration;
use Database\Seeders\RegistrationDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_representative_participants_without_duplicates(): void
    {
        $session = AttendanceSession::create(['name' => 'Sesi Demo']);

        $this->seed(RegistrationDemoSeeder::class);
        $this->seed(RegistrationDemoSeeder::class);

        $this->assertDatabaseCount('registrations', 25);
        $this->assertSame(5, Registration::query()->where('admin_status', 'pending')->count());
        $this->assertSame(2, Registration::query()->where('admin_status', 'ditolak')->count());
        $this->assertSame(8, Registration::query()->where('screening_status', 'lolos')->count());
        $this->assertSame(3, Registration::query()
            ->where('admin_status', 'lolos')
            ->where('screening_status', 'ditolak')
            ->count());
        $this->assertSame(8, Attendance::query()
            ->where('attendance_session_id', $session->id)
            ->count());
    }
}
