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
    ];

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
