<?php

namespace Tests\Feature;

use App\Models\Registration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_register_without_shirt_size_sleeve_type_and_payment_proof(): void
    {
        Storage::fake('r2');

        $response = $this->post(route('register.store'), $this->registrationPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('success', true);

        $registration = Registration::query()->firstOrFail();

        $this->assertNull($registration->sleeve_type);
        $this->assertNull($registration->shirt_size);
        $this->assertCount(8, $registration->files);
        $this->assertFalse($registration->files->contains('field_key', 'buktiBayar'));

        $folder = 'registrations/peserta-uji--'.strtolower(substr(str_replace('-', '', $registration->id), -12));
        Storage::disk('r2')->assertExists($folder.'/sertifikat-makesta.pdf');
        Storage::disk('r2')->assertExists($folder.'/ktp.jpg');
        Storage::disk('r2')->assertExists($folder.'/foto-formal-3x4.jpg');
    }

    public function test_duplicate_names_receive_distinct_r2_folders(): void
    {
        Storage::fake('r2');

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
            ->post(route('register.store'), $this->registrationPayload('first@example.com'))
            ->assertCreated();

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
            ->post(route('register.store'), $this->registrationPayload('second@example.com'))
            ->assertCreated();

        $folders = Registration::query()->orderBy('created_at')->get()->map(
            fn (Registration $registration): string => 'registrations/peserta-uji--'.strtolower(substr(str_replace('-', '', $registration->id), -12)),
        );

        $this->assertCount(2, $folders->unique());
        Storage::disk('r2')->assertExists($folders[0].'/formulir-pendaftaran.pdf');
        Storage::disk('r2')->assertExists($folders[1].'/formulir-pendaftaran.pdf');
    }

    public function test_html_and_script_payloads_are_rejected(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.20'])
            ->postJson(route('register.store'), [
                'name' => '<script>alert(1)</script>',
                'gender' => 'Laki-laki',
                'delegation' => 'PAC IPNU Magetan',
                'reason' => 'Teks biasa',
                'whatsapp' => '081234567890',
                'birthDate' => '2000-01-01',
                'email' => 'xss@example.com',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_registration_is_rate_limited_per_ip(): void
    {
        $request = $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.30']);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $request->postJson(route('register.store'), [])->assertUnprocessable();
        }

        $request->postJson(route('register.store'), [])->assertTooManyRequests();
    }

    public function test_turnstile_is_verified_server_side_with_action_and_hostname(): void
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
                'action' => 'registration',
            ]),
        ]);

        Storage::fake('r2');

        $payload = $this->registrationPayload('turnstile@example.com');
        $payload['cf-turnstile-response'] = 'valid-token';

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.40'])
            ->post(route('register.store'), $payload)
            ->assertCreated();

        Http::assertSent(fn ($request): bool => $request->url() === 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
            && $request['response'] === 'valid-token'
            && $request['remoteip'] === '198.51.100.40');
    }

    public function test_turnstile_rejects_wrong_hostname(): void
    {
        config([
            'services.turnstile.site_key' => 'site-key',
            'services.turnstile.secret_key' => 'secret-key',
            'services.turnstile.allowed_hostnames' => ['localhost'],
        ]);

        Http::fake([
            'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'hostname' => 'attacker.example',
                'action' => 'registration',
            ]),
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.50'])
            ->postJson(route('register.store'), [
                'name' => 'Peserta Uji',
                'gender' => 'Laki-laki',
                'delegation' => 'PAC IPNU Magetan',
                'reason' => 'Teks biasa',
                'whatsapp' => '081234567890',
                'birthDate' => '2000-01-01',
                'email' => 'wrong-host@example.com',
                'cf-turnstile-response' => 'wrong-host-token',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cf-turnstile-response');
    }

    /**
     * @return array<string, mixed>
     */
    private function registrationPayload(string $email = 'peserta@example.com'): array
    {
        return [
            'name' => 'Peserta Uji',
            'gender' => 'Laki-laki',
            'delegation' => 'PAC IPNU Magetan',
            'reason' => 'Ingin mengembangkan kapasitas kaderisasi organisasi.',
            'whatsapp' => '081234567890',
            'birthDate' => '2000-01-01',
            'email' => $email,
            'sertifikatMakesta' => UploadedFile::fake()->create('makesta.pdf', 100, 'application/pdf'),
            'sertifikatLakmud' => UploadedFile::fake()->create('lakmud.pdf', 100, 'application/pdf'),
            'rekomendasi' => UploadedFile::fake()->create('rekomendasi.pdf', 100, 'application/pdf'),
            'essay' => UploadedFile::fake()->create('essay.pdf', 100, 'application/pdf'),
            'ktpKta' => UploadedFile::fake()->image('kta.jpg'),
            'formulir' => UploadedFile::fake()->create('formulir.pdf', 100, 'application/pdf'),
            'paktaIntegritas' => UploadedFile::fake()->create('pakta.pdf', 100, 'application/pdf'),
            'fotoFormal' => UploadedFile::fake()->image('foto-3x4-merah.jpg', 300, 400),
        ];
    }
}
