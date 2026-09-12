<?php

namespace App\Http\Requests;

use App\Rules\PlainText;
use App\Rules\ValidTurnstile;
use App\Services\TurnstileVerifier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->normalizeSingleLine($this->input('name')),
            'gender' => $this->normalizeSingleLine($this->input('gender')),
            'delegation' => $this->normalizeSingleLine($this->input('delegation')),
            'reason' => $this->normalizeMultiline($this->input('reason')),
            'whatsapp' => $this->normalizeSingleLine($this->input('whatsapp')),
            'email' => mb_strtolower($this->normalizeSingleLine($this->input('email'))),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $plainText = new PlainText;

        return [
            'name' => ['required', 'string', 'max:100', $plainText, 'regex:/^[\pL\pM\s.\',\-]+$/u'],
            'gender' => ['required', Rule::in(['Laki-laki', 'Perempuan'])],
            'delegation' => ['required', 'string', 'max:100', $plainText, 'regex:/^[\pL\pM\s.\',\/\-\d]+$/u'],
            'reason' => ['required', 'string', 'max:1000', $plainText, 'regex:/^[\pL\pM\s\d.,;:!?\'\"\/\-\(\)\n]+$/u'],
            'whatsapp' => ['required', 'string', 'max:30', 'regex:/^\+?[0-9]{8,15}$/'],
            'birthDate' => ['required', 'date_format:Y-m-d', 'after_or_equal:1950-01-01', 'before:today'],
            'email' => ['required', 'email:rfc,dns', 'max:150', 'regex:/^[^@]+@[^@]+\.[^@]+$/', 'unique:registrations,email'],
            'cf-turnstile-response' => $this->turnstileRules(),
            'sertifikatMakesta' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'sertifikatLakmud' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'rekomendasi' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'essay' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'ktpKta' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'formulir' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'paktaIntegritas' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'fotoFormal' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain.',
            'email.email' => 'Format email tidak valid. Pastikan menggunakan format yang benar (contoh: nama@email.com).',
            'email.regex' => 'Format email tidak valid. Pastikan menggunakan format yang benar (contoh: nama@email.com).',
            'name.required' => 'Nama Lengkap wajib diisi.',
            'name.max' => 'Nama Lengkap terlalu panjang (maksimal 100 karakter).',
            'name.regex' => 'Nama Lengkap hanya boleh berisi huruf, spasi, titik, koma, tanda hubung, dan apostrof.',
            'delegation.regex' => 'Delegasi hanya boleh berisi huruf, angka, spasi, titik, koma, tanda hubung, dan garis miring.',
            'reason.max' => 'Alasan pendaftaran terlalu panjang (maksimal 1000 karakter).',
            'reason.regex' => 'Alasan pendaftaran tidak boleh berisi simbol atau karakter yang tidak wajar.',
            'whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka (8-15 digit). Contoh: 081234567890',
            'birthDate.before' => 'Tanggal lahir harus sebelum hari ini.',
            '*.mimes' => 'Format berkas yang dipilih tidak sesuai.',
            '*.max' => 'Ukuran berkas maksimal 10 MB.',
        ];
    }

    private function normalizeSingleLine(mixed $value): string
    {
        if (! is_string($value)) {
            return '';
        }

        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }

    private function normalizeMultiline(mixed $value): string
    {
        if (! is_string($value)) {
            return '';
        }

        $value = str_replace(["\r\n", "\r"], "\n", $value);

        return trim((string) preg_replace('/[ \t]+/u', ' ', $value));
    }

    /**
     * @return array<int, mixed>
     */
    private function turnstileRules(): array
    {
        $required = app(TurnstileVerifier::class)->isConfigured()
            || app()->isProduction();

        return [
            $required ? 'required' : 'nullable',
            'string',
            'max:2048',
            new ValidTurnstile('registration'),
        ];
    }
}
