<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\RegistrationFile;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    // File fields yang wajib diupload
    private const REQUIRED_FILE_FIELDS = [
        'sertifikatMakesta',
        'sertifikatLakmud',
        'rekomendasi',
        'essay',
        'ktpKta',
        'formulir',
        'paktaIntegritas',
        'fotoFormal',
        'buktiBayar',
    ];

    public function create(): Response
    {
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';

        return Inertia::render('Register', [
            'isOpen' => $isOpen,
        ]);
    }

    public function store(Request $request)
    {
        // Cek apakah pendaftaran dibuka
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';
        if (! $isOpen) {
            return response()->json(['error' => 'Pendaftaran sedang ditutup.'], 403);
        }

        // Validasi text fields
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'gender' => 'required|string|max:20',
            'delegation' => 'required|string|max:100',
            'reason' => 'required|string|max:1000',
            'shirtSize' => 'required|string|max:10',
            'sleeveType' => 'required|string|max:20',
            'whatsapp' => 'required|string|max:30',
            'birthDate' => 'required|string|max:20',
            'email' => 'required|email|max:150|unique:registrations,email',
        ], [
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain.',
            'name.required' => 'Nama Lengkap wajib diisi.',
            'name.max' => 'Nama Lengkap terlalu panjang (Maksimal 100 karakter).',
            'reason.max' => 'Alasan Pendaftaran terlalu panjang (Maksimal 1000 karakter).',
        ]);

        // Validasi file fields
        foreach (self::REQUIRED_FILE_FIELDS as $field) {
            if (! $request->hasFile($field)) {
                return response()->json(['error' => "Berkas \"{$field}\" wajib diunggah."], 400);
            }

            $file = $request->file($field);
            if ($file->getSize() > 10 * 1024 * 1024) {
                return response()->json(['error' => "Berkas \"{$field}\" melebihi batas ukuran 10MB."], 400);
            }

            // Validasi ekstensi
            $ext = strtolower($file->getClientOriginalExtension());
            if (in_array($field, ['rekomendasi', 'essay', 'formulir']) && $ext !== 'pdf') {
                return response()->json(['error' => "Berkas \"{$field}\" wajib berupa format PDF saja."], 400);
            }
            if ($field === 'fotoFormal' && ! in_array($ext, ['png', 'jpg', 'jpeg'])) {
                return response()->json(['error' => 'Foto Formal wajib berupa gambar (PNG / JPG) saja.'], 400);
            }
        }

        // Simpan registrasi
        $registration = Registration::create([
            'name' => $validated['name'],
            'gender' => $validated['gender'],
            'delegation' => $validated['delegation'],
            'reason' => $validated['reason'],
            'shirt_size' => $validated['shirtSize'],
            'sleeve_type' => $validated['sleeveType'],
            'whatsapp' => $validated['whatsapp'],
            'birth_date' => $validated['birthDate'],
            'email' => strtolower($validated['email']),
        ]);

        // Sanitize nama untuk folder R2
        $sanitizedName = Str::slug($validated['name'], '-');
        if (empty($sanitizedName)) {
            $sanitizedName = $registration->id;
        } else {
            $nameCount = Registration::where('name', $validated['name'])->count();
            if ($nameCount > 1) {
                $sanitizedName = $sanitizedName.'-'.($nameCount - 1);
            }
        }

        // Upload file ke R2
        foreach (self::REQUIRED_FILE_FIELDS as $field) {
            $file = $request->file($field);
            $ext = strtolower($file->getClientOriginalExtension());
            $r2Key = "registrations/{$sanitizedName}/{$field}.{$ext}";

            Storage::disk('r2')->put($r2Key, file_get_contents($file->getRealPath()), [
                'ContentType' => $file->getMimeType(),
            ]);

            RegistrationFile::create([
                'registration_id' => $registration->id,
                'field_key' => $field,
                'file_name' => $file->getClientOriginalName(),
                'r2_key' => $r2Key,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);
        }

        return response()->json([
            'success' => true,
            'registrationId' => $registration->id,
            'message' => 'Registrasi berhasil dikirim.',
        ], 201);
    }
}
