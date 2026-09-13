<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Registration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AttendanceRoster
{
    /**
     * @param  array{name: string, description: string|null}  $attributes
     */
    public function createSession(array $attributes): AttendanceSession
    {
        return DB::transaction(function () use ($attributes): AttendanceSession {
            $session = AttendanceSession::create($attributes);
            $registrationIds = Registration::query()
                ->where('screening_status', 'lolos')
                ->pluck('id');

            $now = now();
            $rows = $registrationIds->map(fn (string $registrationId): array => [
                'id' => (string) Str::uuid(),
                'attendance_session_id' => $session->id,
                'registration_id' => $registrationId,
                'status' => Attendance::STATUS_PENDING,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if ($rows !== []) {
                Attendance::query()->insertOrIgnore($rows);
            }

            return $session;
        });
    }

    public function syncRegistration(Registration $registration): void
    {
        if ($registration->screening_status !== 'lolos') {
            return;
        }

        $sessionIds = AttendanceSession::query()->pluck('id');
        $now = now();
        $rows = $sessionIds->map(fn (string $sessionId): array => [
            'id' => (string) Str::uuid(),
            'attendance_session_id' => $sessionId,
            'registration_id' => $registration->id,
            'status' => Attendance::STATUS_PENDING,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        if ($rows !== []) {
            Attendance::query()->insertOrIgnore($rows);
        }
    }
}
