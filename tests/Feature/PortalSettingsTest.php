<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortalSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_portal_settings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('settings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('PortalSettings/Index')
                ->where('isOpen', true),
            );
    }

    public function test_admin_can_close_registration(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('settings.update'), ['isOpen' => false])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(
            'false',
            SystemSetting::getValue('registration_open'),
        );
    }

    public function test_theme_and_account_deletion_settings_are_unavailable(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/settings/profile')->assertOk();
        $this->actingAs($user)->get('/settings/security')->assertOk();
        $this->actingAs($user)->get('/settings/appearance')->assertNotFound();
        $this->actingAs($user)->delete('/settings/profile')->assertStatus(405);
    }
}
