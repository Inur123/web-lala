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
        $registrants = Registration::select([
            'id', 'name', 'gender', 'delegation',
            'admin_status', 'screening_status',
        ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                // Cari foto formal dari file
                $photo = $r->files()->where('field_key', 'fotoFormal')->first();

                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'gender' => $r->gender,
                    'delegation' => $r->delegation,
                    'adminStatus' => $r->admin_status,
                    'screeningStatus' => $r->screening_status,
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
