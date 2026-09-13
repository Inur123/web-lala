<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
