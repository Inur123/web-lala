<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Registration;
use App\Models\RegistrationFile;
use App\Models\SystemSetting;
use App\Services\PublicRegistrantCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';
        $totalRegistrants = Registration::count();

        return Inertia::render('PortalSettings/Index', [
            'isOpen' => $isOpen,
            'totalRegistrants' => $totalRegistrants,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'isOpen' => 'required|boolean',
        ]);

        SystemSetting::setValue(
            'registration_open',
            $request->boolean('isOpen') ? 'true' : 'false'
        );

        return response()->json([
            'success' => true,
            'message' => $request->boolean('isOpen')
                ? 'Pendaftaran berhasil dibuka.'
                : 'Pendaftaran berhasil ditutup.',
        ]);
    }

    /**
     * API JSON endpoint
     */
    public function apiIndex(): JsonResponse
    {
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';

        return response()->json(['isOpen' => $isOpen]);
    }

    /**
     * Hapus permanen seluruh data pendaftar beserta berkas fisik (lokal & R2)
     */
    public function resetRegistrations(Request $request, PublicRegistrantCache $cache): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ], [
            'password.required' => 'Kata sandi konfirmasi wajib diisi.',
            'password.current_password' => 'Kata sandi yang Anda masukkan salah.',
        ]);

        $r2Keys = RegistrationFile::query()->pluck('r2_key')->filter()->all();

        if (! empty($r2Keys)) {
            foreach (array_chunk($r2Keys, 500) as $chunk) {
                try {
                    Storage::disk('local')->delete($chunk);
                } catch (Throwable $e) {
                    report($e);
                }

                try {
                    Storage::disk('r2')->delete($chunk);
                } catch (Throwable $e) {
                    report($e);
                }
            }
        }

        try {
            Storage::disk('local')->deleteDirectory('registrations');
        } catch (Throwable $e) {
            report($e);
        }

        DB::transaction(function (): void {
            RegistrationFile::query()->delete();
            Attendance::query()->delete();
            Registration::query()->delete();
        });

        try {
            $cache->forget();
        } catch (Throwable $e) {
            report($e);
        }

        Log::warning('Seluruh data pendaftar dan berkas berhasil direset oleh admin.', [
            'admin_id' => $request->user()?->id,
            'admin_email' => $request->user()?->email,
            'ip' => $request->ip(),
            'deleted_files_count' => count($r2Keys),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Seluruh data pendaftar dan berkas berhasil dihapus permanen.',
            'totalRegistrants' => 0,
        ]);
    }
}
