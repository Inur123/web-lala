<?php

namespace App\Actions\Fortify;

use App\Rules\ValidTurnstile;
use App\Services\TurnstileVerifier;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ValidateTurnstile
{
    public function handle(Request $request, Closure $next): mixed
    {
        $required = app(TurnstileVerifier::class)->isConfigured()
            || app()->isProduction();

        Validator::make($request->all(), [
            'cf-turnstile-response' => [
                $required ? 'required' : 'nullable',
                'string',
                'max:2048',
                new ValidTurnstile('login'),
            ],
        ], [
            'cf-turnstile-response.required' => 'Selesaikan verifikasi keamanan terlebih dahulu.',
        ])->validate();

        return $next($request);
    }
}
