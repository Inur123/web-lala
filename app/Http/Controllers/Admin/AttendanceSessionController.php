<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceSessionRequest;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Services\AttendanceRoster;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceSessionController extends Controller
{
    public function index(): Response
    {
        $sessions = AttendanceSession::query()
            ->withCount([
                'attendances' => function (Builder $query): void {
                    $query->whereHas('registration', function (Builder $registrationQuery): void {
                        $registrationQuery->where('screening_status', 'lolos');
                    });
                },
                'attendances as present_count' => function (Builder $query): void {
                    $query->where('status', Attendance::STATUS_PRESENT)
                        ->whereHas('registration', function (Builder $registrationQuery): void {
                            $registrationQuery->where('screening_status', 'lolos');
                        });
                },
            ])
            ->latest()
            ->get();

        return Inertia::render('Absensi/Index', [
            'sessions' => $sessions,
        ]);
    }

    public function store(
        StoreAttendanceSessionRequest $request,
        AttendanceRoster $roster,
    ): RedirectResponse {
        /** @var array{name: string, description: string|null} $validated */
        $validated = $request->validated();
        $roster->createSession($validated);

        return redirect()
            ->route('admin.absensi.index')
            ->with('success', 'Sesi absensi berhasil dibuat.');
    }

    public function show(AttendanceSession $absensi): Response
    {
        $timezone = (string) config('app.timezone', 'Asia/Jakarta');
        $attendances = Attendance::query()
            ->where('attendance_session_id', $absensi->id)
            ->whereHas('registration', function (Builder $query): void {
                $query->where('screening_status', 'lolos');
            })
            ->with('registration')
            ->get()
            ->sortBy(fn (Attendance $attendance): string => strtolower($attendance->registration->name))
            ->values()
            ->map(fn (Attendance $attendance): array => [
                'id' => $attendance->id,
                'attendance_session_id' => $attendance->attendance_session_id,
                'registration_id' => $attendance->registration_id,
                'status' => $attendance->status,
                'scanned_at' => $attendance->scanned_at,
                'scanned_at_formatted' => $attendance->scanned_at?->timezone($timezone)
                    ->translatedFormat('l, d F Y | H.i').' WIB',
                'registration' => [
                    'name' => $attendance->registration->name,
                    'delegation' => $attendance->registration->delegation,
                    'gender' => $attendance->registration->gender,
                ],
            ]);

        return Inertia::render('Absensi/Show', [
            'session' => [
                'id' => $absensi->id,
                'name' => $absensi->name,
                'description' => $absensi->description,
                'created_at' => $absensi->created_at,
                'attendances' => $attendances,
            ],
        ]);
    }

    public function scanner(AttendanceSession $absensi): Response
    {
        $absensi->loadCount([
            'attendances as total_attended' => function (Builder $query): void {
                $query->where('status', Attendance::STATUS_PRESENT)
                    ->whereHas('registration', function (Builder $registrationQuery): void {
                        $registrationQuery->where('screening_status', 'lolos');
                    });
            },
            'attendances as total_registered' => function (Builder $query): void {
                $query->whereHas('registration', function (Builder $registrationQuery): void {
                    $registrationQuery->where('screening_status', 'lolos');
                });
            },
        ]);

        $timezone = (string) config('app.timezone', 'Asia/Jakarta');
        $recentAttendances = Attendance::query()
            ->with('registration')
            ->where('attendance_session_id', $absensi->id)
            ->where('status', Attendance::STATUS_PRESENT)
            ->whereHas('registration', function (Builder $query): void {
                $query->where('screening_status', 'lolos');
            })
            ->orderByDesc('scanned_at')
            ->limit(10)
            ->get()
            ->map(fn (Attendance $attendance): array => [
                'id' => $attendance->id,
                'name' => $attendance->registration->name,
                'delegation' => $attendance->registration->delegation,
                'gender' => $attendance->registration->gender,
                'scanned_at' => $attendance->scanned_at?->timezone($timezone)->format('H.i').' WIB',
            ]);

        return Inertia::render('Absensi/Scan', [
            'session' => $absensi,
            'initialRecentAttendances' => $recentAttendances,
        ]);
    }

    public function destroy(AttendanceSession $absensi): RedirectResponse
    {
        $absensi->delete();

        return redirect()
            ->route('admin.absensi.index')
            ->with('success', 'Sesi absensi berhasil dihapus.');
    }
}
