<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\TurnstileVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered()
    {
        $response = $this->get(route('login'));

        $response->assertOk();
    }

    public function test_users_can_authenticate_using_the_login_screen()
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_configured_turnstile_is_required_for_login(): void
    {
        config([
            'services.turnstile.site_key' => 'site-key',
            'services.turnstile.secret_key' => 'secret-key',
            'services.turnstile.allowed_hostnames' => ['localhost'],
        ]);

        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('cf-turnstile-response');
    }

    public function test_users_can_login_with_a_valid_turnstile_token(): void
    {
        config([
            'services.turnstile.site_key' => 'site-key',
            'services.turnstile.secret_key' => 'secret-key',
            'services.turnstile.allowed_hostnames' => ['localhost'],
        ]);

        Http::fake([
            'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'hostname' => 'localhost',
                'action' => 'login',
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
            'cf-turnstile-response' => 'valid-login-token',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_official_local_turnstile_test_keys_accept_the_test_action(): void
    {
        config([
            'services.turnstile.site_key' => '1x00000000000000000000AA',
            'services.turnstile.secret_key' => '1x0000000000000000000000000000000AA',
            'services.turnstile.allowed_hostnames' => ['localhost'],
        ]);

        Http::fake([
            'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'hostname' => 'dummy-key-pass',
                'action' => 'test',
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
            'cf-turnstile-response' => 'XXXX.DUMMY.TOKEN.XXXX',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_local_turnstile_test_key_exception_is_disabled_in_production(): void
    {
        $this->app['env'] = 'production';

        config([
            'services.turnstile.site_key' => '1x00000000000000000000AA',
            'services.turnstile.secret_key' => '1x0000000000000000000000000000000AA',
            'services.turnstile.allowed_hostnames' => ['localhost'],
        ]);

        Http::fake([
            'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'hostname' => 'dummy-key-pass',
                'action' => 'test',
            ]),
        ]);

        $this->assertFalse(
            app(TurnstileVerifier::class)->verify(
                'XXXX.DUMMY.TOKEN.XXXX',
                '127.0.0.1',
                'login',
            ),
        );
    }

    public function test_users_can_not_authenticate_with_invalid_password()
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'email' => 'Email atau kata sandi yang Anda masukkan salah.',
        ]);
    }

    public function test_users_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $response->assertRedirect(route('home'));

        $this->assertGuest();
    }

    public function test_users_are_rate_limited()
    {
        $user = User::factory()->create();

        RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertTooManyRequests();
    }

    public function test_inertia_login_rate_limit_returns_with_a_toast(): void
    {
        $user = User::factory()->create();

        RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

        $response = $this
            ->from(route('login'))
            ->withHeader('X-Inertia', 'true')
            ->post(route('login.store'), [
                'email' => $user->email,
                'password' => 'wrong-password',
            ]);

        $response
            ->assertStatus(303)
            ->assertRedirect(route('login'))
            ->assertSessionHas('inertia.flash_data.toast', [
                'type' => 'error',
                'message' => 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
            ]);
    }
}
