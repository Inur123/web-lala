<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\PublicRegistrantCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
    public function registrantsJson(Request $request, PublicRegistrantCache $cache): JsonResponse
    {
        $response = response()->json(['registrants' => $cache->all()]);
        $response->setPublic();
        $response->setMaxAge(30);
        $response->setEtag(hash('sha256', (string) $response->getContent()));
        $response->isNotModified($request);

        return $response;
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
