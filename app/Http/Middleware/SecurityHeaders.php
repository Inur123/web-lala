<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '0');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');

        if (app()->isProduction()) {
            $response->headers->set('Content-Security-Policy', implode(' ', [
                "default-src 'self';",
                "base-uri 'self';",
                "object-src 'none';",
                "frame-ancestors 'self';",
                "form-action 'self';",
                "script-src 'self' https://challenges.cloudflare.com;",
                'frame-src https://challenges.cloudflare.com;',
                "connect-src 'self' https://challenges.cloudflare.com;",
                "img-src 'self' data: blob:;",
                "font-src 'self' data:;",
                "style-src 'self' 'unsafe-inline';",
                "worker-src 'self' blob:;",
            ]));
        }

        if (app()->isProduction() && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
