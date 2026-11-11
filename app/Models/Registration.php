<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string $name
 * @property string $gender
 * @property string|null $shirt_size
 * @property string $delegation
 * @property string $reason
 * @property string $whatsapp
 * @property Carbon|string $birth_date
 * @property string $email
 * @property string $qr_token
 * @property string $admin_status
 * @property Carbon|CarbonImmutable|null $admin_reviewed_at
 * @property string $screening_status
 * @property Carbon|CarbonImmutable|null $screening_reviewed_at
 * @property-read Collection<int, RegistrationFile> $files
 * @property Carbon|CarbonImmutable|null $created_at
 * @property Carbon|CarbonImmutable|null $updated_at
 */
class Registration extends Model
{
    use HasUuids;

    protected static function booted(): void
    {
        static::creating(function (Registration $registration): void {
            if (blank($registration->qr_token)) {
                $registration->qr_token = 'lala-2026-'.Str::upper(Str::random(32));
            }
        });

        static::saving(function (Registration $registration): void {
            if ($registration->admin_status === 'ditolak') {
                $registration->screening_status = 'ditolak';
                $registration->screening_reviewed_at ??= now();

                return;
            }

            if (
                $registration->isDirty('admin_status')
                && $registration->getOriginal('admin_status') === 'ditolak'
            ) {
                $registration->screening_status = 'pending';
                $registration->screening_reviewed_at = null;
            }
        });
    }

    protected $fillable = [
        'name',
        'gender',
        'shirt_size',
        'delegation',
        'reason',
        'whatsapp',
        'birth_date',
        'email',
        'admin_status',
        'admin_reviewed_at',
        'screening_status',
        'screening_reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'admin_reviewed_at' => 'datetime',
            'screening_reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<RegistrationFile, $this>
     */
    public function files(): HasMany
    {
        return $this->hasMany(RegistrationFile::class);
    }

    /**
     * @return HasMany<Attendance, $this>
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
