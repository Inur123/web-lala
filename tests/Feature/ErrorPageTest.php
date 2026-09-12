<?php

namespace Tests\Feature;

use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    public function test_error_pages_only_show_the_status_code(): void
    {
        config(['app.debug' => false]);

        $this->get('/halaman-yang-tidak-ada')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page
                ->component('Error')
                ->where('status', 404)
            );
    }
}
