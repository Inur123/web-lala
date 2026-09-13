<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    public function test_unused_account_recovery_and_verification_routes_are_disabled(): void
    {
        $this->get('/forgot-password')->assertNotFound();
        $this->post('/forgot-password', ['email' => 'admin@example.com'])->assertNotFound();
        $this->get('/reset-password/token-uji')->assertNotFound();
        $this->post('/reset-password', [])->assertNotFound();
        $this->get('/email/verify')->assertNotFound();
        $this->get('/email/verify/1/hash-uji')->assertNotFound();
        $this->post('/email/verification-notification')->assertNotFound();
    }
}
