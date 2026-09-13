<?php

namespace App\Http\Requests\Auth;

use App\Rules\ValidTurnstile;
use App\Services\TurnstileVerifier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $turnstileIsRequired = app(TurnstileVerifier::class)->isConfigured()
            || app()->isProduction();

        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'cf-turnstile-response' => [
                $turnstileIsRequired ? 'required' : 'nullable',
                'string',
                'max:2048',
                new ValidTurnstile('login'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cf-turnstile-response.required' => 'Selesaikan verifikasi keamanan terlebih dahulu.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');

        if (is_string($email)) {
            $this->merge([
                'email' => Str::lower(trim($email)),
            ]);
        }
    }
}
