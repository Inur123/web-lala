<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['sidebar_state']);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function ($response, $exception, Request $request) {
            if (
                $response->getStatusCode() === 429
                && $request->header('X-Inertia')
                && ! $request->isMethod('GET')
            ) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
                ]);

                return redirect()
                    ->back(303)
                    ->withHeaders([
                        'Retry-After' => $response->headers->get('Retry-After', '60'),
                    ]);
            }

            if (in_array($response->getStatusCode(), [401, 403, 404, 419, 429, 500, 503])) {
                // Hanya gunakan halaman error Inertia untuk error 500 jika tidak dalam mode debug (local)
                if (! app()->hasDebugModeEnabled() || $response->getStatusCode() !== 500) {
                    // Pastikan version asset Inertia tetap disuntikkan agar tidak terjadi mismatch yang menyebabkan hard reload
                    $inertiaMiddleware = new HandleInertiaRequests;
                    Inertia::version(fn () => $inertiaMiddleware->version($request));

                    return Inertia::render('Error', ['status' => $response->getStatusCode()])
                        ->toResponse($request)
                        ->setStatusCode($response->getStatusCode());
                }
            }

            return $response;
        });
    })->create();
