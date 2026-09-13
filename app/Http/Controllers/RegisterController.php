<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrationRequest;
use App\Jobs\UploadRegistrationFilesToR2;
use App\Mail\RegistrationConfirmation;
use App\Models\Registration;
use App\Models\RegistrationFile;
use App\Models\SystemSetting;
use App\Services\PublicRegistrantCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

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
    ];

    private const FILE_NAMES = [
        'sertifikatMakesta' => 'sertifikat-makesta',
        'sertifikatLakmud' => 'sertifikat-lakmud',
        'rekomendasi' => 'surat-rekomendasi',
        'essay' => 'esai-karya-tulis',
        'ktpKta' => 'ktp',
        'formulir' => 'formulir-pendaftaran',
        'paktaIntegritas' => 'pakta-integritas',
        'fotoFormal' => 'foto-formal-3x4',
    ];

    public function create(): Response
    {
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';

        return Inertia::render('Register', [
            'isOpen' => $isOpen,
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }

    public function store(StoreRegistrationRequest $request, PublicRegistrantCache $cache): JsonResponse
    {
        // Cek apakah pendaftaran dibuka
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';
        if (! $isOpen) {
            return response()->json(['error' => 'Pendaftaran sedang ditutup.'], 403);
        }

        $validated = $request->validated();
        $uploadedKeys = [];

        DB::beginTransaction();

        try {
            $registration = Registration::create([
                'name' => $validated['name'],
                'gender' => $validated['gender'],
                'delegation' => $validated['delegation'],
                'reason' => $validated['reason'],
                'whatsapp' => $validated['whatsapp'],
                'birth_date' => $validated['birthDate'],
                'email' => $validated['email'],
            ]);

            $nameSlug = Str::limit(Str::slug($validated['name'], '-'), 80, '');
            $nameSlug = $nameSlug !== '' ? $nameSlug : 'peserta';
            $uniqueSuffix = Str::lower(Str::substr(Str::replace('-', '', $registration->id), -12));
            $folder = $nameSlug.'--'.$uniqueSuffix;

            foreach (self::REQUIRED_FILE_FIELDS as $field) {
                $file = $request->file($field);
                $mimeType = (string) $file->getMimeType();
                $extension = $this->safeExtension($mimeType);
                $storedName = self::FILE_NAMES[$field].'.'.$extension;
                $r2Key = "registrations/{$folder}/{$storedName}";
                $stream = fopen($file->getRealPath(), 'rb');

                if ($stream === false) {
                    throw new RuntimeException('Berkas unggahan tidak dapat dibaca.');
                }

                try {
                    $stored = Storage::disk('local')->put($r2Key, $stream);
                } finally {
                    fclose($stream);
                }

                if (! $stored) {
                    throw new RuntimeException('Berkas gagal disimpan ke penyimpanan.');
                }

                $uploadedKeys[] = $r2Key;

                RegistrationFile::create([
                    'registration_id' => $registration->id,
                    'field_key' => $field,
                    'file_name' => $storedName,
                    'r2_key' => $r2Key,
                    'file_size' => $file->getSize(),
                    'mime_type' => $mimeType,
                ]);
            }

            DB::commit();
        } catch (Throwable $exception) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            if ($uploadedKeys !== []) {
                Storage::disk('local')->delete($uploadedKeys);
                Storage::disk('r2')->delete($uploadedKeys);
            }

            report($exception);

            return response()->json([
                'error' => 'Pendaftaran belum dapat disimpan. Silakan coba lagi.',
            ], 500);
        }

        try {
            $cache->forget();
        } catch (Throwable $exception) {
            Log::warning('Cache daftar pendaftar belum dapat dibersihkan.', [
                'registration_id' => $registration->id,
                'exception' => $exception::class,
            ]);
            report($exception);
        }

        try {
            UploadRegistrationFilesToR2::dispatch($registration->id);
        } catch (Throwable $exception) {
            Log::error('Job upload R2 belum dapat dimasukkan ke antrean.', [
                'registration_id' => $registration->id,
                'exception' => $exception::class,
            ]);
            report($exception);
        }

        try {
            Mail::to($registration->email)->queue(new RegistrationConfirmation($registration));
        } catch (Throwable $exception) {
            Log::error('Email konfirmasi belum dapat dimasukkan ke antrean.', [
                'registration_id' => $registration->id,
                'exception' => $exception::class,
            ]);
            report($exception);
        }

        return response()->json([
            'success' => true,
            'registrationId' => $registration->id,
            'message' => 'Registrasi berhasil dikirim.',
        ], 201);
    }

    private function safeExtension(string $mimeType): string
    {
        return match ($mimeType) {
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            default => throw new RuntimeException('Format berkas tidak didukung.'),
        };
    }
}
