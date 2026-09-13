<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

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
