<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Ambil value setting berdasarkan key.
     */
    public static function getValue(string $key, string $default = ''): string
    {
        $setting = static::find($key);
        return $setting ? $setting->value : $default;
    }

    /**
     * Set value setting berdasarkan key.
     */
    public static function setValue(string $key, string $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
