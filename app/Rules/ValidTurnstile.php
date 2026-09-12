<?php

namespace App\Rules;

use App\Services\TurnstileVerifier;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidTurnstile implements ValidationRule
{
    public function __construct(private readonly string $action) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $valid = app(TurnstileVerifier::class)->verify(
            is_string($value) ? $value : null,
            request()->ip(),
            $this->action,
        );

        if (! $valid) {
            $fail('Verifikasi keamanan gagal atau kedaluwarsa. Silakan coba lagi.');
        }
    }
}
