<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PesertaPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/peserta')->assertRedirect('/login');
        $this->get('/peserta/administrasi')->assertRedirect('/login');
        $this->get('/peserta/screening')->assertRedirect('/login');
    }

    public function test_peserta_root_redirects_to_administrasi(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/peserta')
            ->assertRedirect(route('admin.peserta.administrasi'));
    }

    public function test_administrasi_page_only_includes_participants_with_passed_admin_status(): void
    {
        $user = User::factory()->create();

        $adminLolos = Registration::create([
            'name' => 'Ahmad Lolos Admin',
            'gender' => 'Laki-laki',
            'delegation' => 'PAC Magetan',
            'reason' => 'Ingin belajar',
            'whatsapp' => '081234567890',
            'birth_date' => '2004-01-01',
            'email' => 'ahmad@example.com',
            'admin_status' => 'lolos',
            'admin_reviewed_at' => now(),
            'screening_status' => 'pending',
        ]);

        $adminPending = Registration::create([
            'name' => 'Budi Pending Admin',
            'gender' => 'Laki-laki',
            'delegation' => 'PAC Kawedanan',
            'reason' => 'Ingin belajar',
            'whatsapp' => '081234567891',
            'birth_date' => '2004-02-02',
            'email' => 'budi@example.com',
            'admin_status' => 'pending',
            'screening_status' => 'pending',
        ]);

        $adminDitolak = Registration::create([
            'name' => 'Candra Ditolak Admin',
            'gender' => 'Laki-laki',
            'delegation' => 'PAC Sukomoro',
            'reason' => 'Ingin belajar',
            'whatsapp' => '081234567892',
            'birth_date' => '2004-03-03',
            'email' => 'candra@example.com',
            'admin_status' => 'ditolak',
            'admin_reviewed_at' => now(),
            'screening_status' => 'ditolak',
        ]);

        $this->actingAs($user)
            ->get('/peserta/administrasi')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Peserta/Administrasi')
                ->has('registrants', 1)
                ->where('registrants.0.id', $adminLolos->id)
                ->where('registrants.0.name', 'Ahmad Lolos Admin')
            );
    }

    public function test_screening_page_only_includes_participants_with_passed_screening_status(): void
    {
        $user = User::factory()->create();

        $screeningLolos = Registration::create([
            'name' => 'Dewi Lolos Screening',
            'gender' => 'Perempuan',
            'delegation' => 'PAC Bendo',
            'reason' => 'Aktif berorganisasi',
            'whatsapp' => '081234567893',
            'birth_date' => '2005-04-04',
            'email' => 'dewi@example.com',
            'admin_status' => 'lolos',
            'admin_reviewed_at' => now(),
            'screening_status' => 'lolos',
            'screening_reviewed_at' => now(),
        ]);

        $screeningPending = Registration::create([
            'name' => 'Eka Pending Screening',
            'gender' => 'Perempuan',
            'delegation' => 'PAC Barat',
            'reason' => 'Aktif berorganisasi',
            'whatsapp' => '081234567894',
            'birth_date' => '2005-05-05',
            'email' => 'eka@example.com',
            'admin_status' => 'lolos',
            'admin_reviewed_at' => now(),
            'screening_status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get('/peserta/screening')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Peserta/Screening')
                ->has('registrants', 1)
                ->where('registrants.0.id', $screeningLolos->id)
                ->where('registrants.0.name', 'Dewi Lolos Screening')
            );
    }
}
