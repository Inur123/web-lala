<?php

namespace App\Rules;

use App\Services\UploadedFileSecurityScanner;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class SafeUploadedFile implements ValidationRule
{
    /**
     * @param  array<int, string>  $allowedMimeTypes
     */
    public function __construct(private readonly array $allowedMimeTypes) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            return;
        }

        $message = app(UploadedFileSecurityScanner::class)->validate(
            $value,
            $this->allowedMimeTypes,
        );

        if ($message !== null) {
            $fail($message);
        }
    }
}
