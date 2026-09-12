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
            ->assertSeeText('404')
            ->assertSeeText('Halaman tidak ditemukan')
            ->assertSeeText('Kembali ke beranda')
            ->assertSee('/images/logo-lala.png', false)
            ->assertDontSeeText('Not Found')
            ->assertDontSee('<nav', false)
            ->assertDontSee('<footer', false);
    }
}
