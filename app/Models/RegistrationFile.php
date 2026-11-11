<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $registration_id
 * @property string $field_key
 * @property string $file_name
 * @property string $r2_key
 * @property int|null $file_size
 * @property string|null $mime_type
 * @property string $upload_status
 * @property int $upload_attempts
 * @property string|null $upload_error
 * @property Carbon|CarbonImmutable|null $upload_attempted_at
 * @property Carbon|CarbonImmutable|null $uploaded_at
 * @property-read Registration $registration
 * @property Carbon|CarbonImmutable|null $created_at
 * @property Carbon|CarbonImmutable|null $updated_at
 */
class RegistrationFile extends Model
{
    use HasUuids;

    protected $fillable = [
        'registration_id',
        'field_key',
        'file_name',
        'r2_key',
        'file_size',
        'mime_type',
        'upload_status',
        'upload_attempts',
        'upload_error',
        'upload_attempted_at',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'upload_attempts' => 'integer',
            'upload_attempted_at' => 'datetime',
            'uploaded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Registration, $this>
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
