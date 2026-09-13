<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $attendance_session_id
 * @property string $registration_id
 * @property string $status
 * @property Carbon|null $scanned_at
 * @property-read AttendanceSession $session
 * @property-read Registration $registration
 */
class Attendance extends Model
{
    use HasUuids;

    public const STATUS_PENDING = 'belum absen';

    public const STATUS_PRESENT = 'sudah absen';

    protected $fillable = ['attendance_session_id', 'registration_id', 'status', 'scanned_at'];

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<AttendanceSession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    /**
     * @return BelongsTo<Registration, $this>
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }
}
