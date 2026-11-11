<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScanAttendanceRequest;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AttendanceScanController extends Controller
{
    public function store(
        ScanAttendanceRequest $request,
        AttendanceSession $absensi,
    ): JsonResponse {
        $result = DB::transaction(function () use ($request, $absensi): array {
            $registration = Registration::query()
                ->where('qr_token', $request->validated('qr_token'))
                ->lockForUpdate()
                ->first();

            if ($registration === null) {
                return ['status' => 404, 'message' => 'Data peserta tidak ditemukan.'];
            }

            if ($registration->screening_status !== 'lolos') {
                return ['status' => 403, 'message' => 'Peserta ini belum lolos screening.'];
            }

            $attendance = Attendance::query()->firstOrCreate(
                [
                    'attendance_session_id' => $absensi->id,
                    'registration_id' => $registration->id,
                ],
                ['status' => Attendance::STATUS_PENDING],
            );

            $scannedAt = now();
            $updated = Attendance::query()
                ->whereKey($attendance->id)
                ->where('status', Attendance::STATUS_PENDING)
                ->update([
                    'status' => Attendance::STATUS_PRESENT,
                    'scanned_at' => $scannedAt,
                ]);

            $timezone = (string) config('app.timezone', 'Asia/Jakarta');
            $photoFile = $registration->files()
                ->select(['id', 'registration_id', 'field_key'])
                ->where('field_key', 'fotoFormal')
                ->first();
            $participantPayload = [
                'participant' => $registration->name,
                'delegation' => $registration->delegation,
                'gender' => $registration->gender,
                'photo_url' => $photoFile !== null
                    ? route('files.photo', ['file' => $photoFile->id], absolute: false)
                    : null,
            ];

            if ($updated === 0) {
                return [
                    'status' => 409,
                    'message' => 'Peserta ini sudah melakukan absensi sebelumnya.',
                    ...$participantPayload,
                    'scanned_at' => $attendance->scanned_at !== null
                        ? $attendance->scanned_at->timezone($timezone)->format('H.i').' WIB'
                        : null,
                ];
            }

            return [
                'status' => 200,
                'message' => 'Absensi berhasil dicatat.',
                ...$participantPayload,
                'scanned_at' => $scannedAt->timezone($timezone)->format('H.i').' WIB',
            ];
        }, 3);

        $status = $result['status'];
        unset($result['status']);

        return response()->json([
            'success' => $status === 200,
            ...$result,
        ], $status);
    }
}
