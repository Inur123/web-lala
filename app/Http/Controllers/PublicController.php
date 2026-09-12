<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    /**
     * Halaman pendaftar (Inertia page)
     */
    public function pendaftar(): Response
    {
        return Inertia::render('Pendaftar');
    }

    /**
     * API: Daftar pendaftar publik (JSON)
     */
    public function registrantsJson(): JsonResponse
    {
        $registrants = Registration::query()->select([
            'id', 'name', 'gender', 'delegation',
            'admin_status', 'screening_status',
        ])
            ->with([
                'files' => fn ($query) => $query->where('field_key', 'fotoFormal'),
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Registration $registration): array {
                $photo = $registration->files->first();

                return [
                    'id' => $registration->id,
                    'name' => $registration->name,
                    'gender' => $registration->gender,
                    'delegation' => $registration->delegation,
                    'adminStatus' => $registration->admin_status,
                    'screeningStatus' => $registration->screening_status,
                    'photoUrl' => $photo
                        ? route('files.photo', ['file' => $photo->id], absolute: false)
                        : null,
                ];
            });

        return response()->json(['registrants' => $registrants]);
    }

    /**
     * API: Status pendaftaran (JSON)
     */
    public function settingsJson(): JsonResponse
    {
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';

        return response()->json(['isOpen' => $isOpen]);
    }
}
