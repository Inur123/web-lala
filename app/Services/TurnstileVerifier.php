<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class TurnstileVerifier
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    private const TEST_SITE_KEY = '1x00000000000000000000AA';

    private const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

    public function isConfigured(): bool
    {
        return filled(config('services.turnstile.site_key'))
            && filled(config('services.turnstile.secret_key'));
    }

    public function verify(?string $token, ?string $ipAddress, string $expectedAction): bool
    {
        if (! $this->isConfigured()) {
            return app()->environment(['local', 'testing']);
        }

        if (! is_string($token) || $token === '' || strlen($token) > 2048) {
            return false;
        }

        try {
            $response = Http::asForm()
                ->acceptJson()
                ->connectTimeout(3)
                ->timeout(8)
                ->post(self::VERIFY_URL, [
                    'secret' => config('services.turnstile.secret_key'),
                    'response' => $token,
                    'remoteip' => $ipAddress,
                    'idempotency_key' => (string) Str::uuid(),
                ]);
        } catch (Throwable $exception) {
            Log::warning('Cloudflare Turnstile verification request failed.', [
                'exception' => $exception::class,
            ]);

            return false;
        }

        if (! $response->successful() || $response->json('success') !== true) {
            Log::notice('Cloudflare Turnstile rejected a verification token.', [
                'status' => $response->status(),
                'errors' => $response->json('error-codes', []),
            ]);

            return false;
        }

        $usesLocalTestKeys = app()->environment(['local', 'testing'])
            && hash_equals(self::TEST_SITE_KEY, (string) config('services.turnstile.site_key'))
            && hash_equals(self::TEST_SECRET_KEY, (string) config('services.turnstile.secret_key'));

        if ($usesLocalTestKeys) {
            return true;
        }

        if ($response->json('action') !== $expectedAction) {
            return false;
        }

        $hostname = Str::lower((string) $response->json('hostname'));
        $allowedHostnames = array_map(
            static fn (string $allowed): string => Str::lower($allowed),
            config('services.turnstile.allowed_hostnames', []),
        );

        return $allowedHostnames !== []
            && in_array($hostname, $allowedHostnames, true);
    }
}
