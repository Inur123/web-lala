<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_receive_security_headers(): void
    {
        $this->get(route('register'))
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('X-XSS-Protection', '0')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_production_csp_allows_turnstile_only_on_required_directives(): void
    {
        $this->app->detectEnvironment(fn (): string => 'production');

        $response = $this->get(route('register'))->assertOk();
        $policy = (string) $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("default-src 'self'", $policy);
        $this->assertStringContainsString('script-src \'self\' https://challenges.cloudflare.com', $policy);
        $this->assertStringContainsString('frame-src https://challenges.cloudflare.com', $policy);
        $this->assertStringContainsString("object-src 'none'", $policy);
    }
}
