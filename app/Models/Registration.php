<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'gender',
        'delegation',
        'reason',
        'shirt_size',
        'sleeve_type',
        'whatsapp',
        'birth_date',
        'email',
        'admin_status',
        'admin_note',
        'admin_reviewed_at',
        'screening_status',
        'screening_note',
        'screening_reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'admin_reviewed_at' => 'datetime',
            'screening_reviewed_at' => 'datetime',
        ];
    }

    public function files(): HasMany
    {
        return $this->hasMany(RegistrationFile::class);
    }
}
