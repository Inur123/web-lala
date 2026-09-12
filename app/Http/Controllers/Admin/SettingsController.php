<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $isOpen = SystemSetting::getValue('registration_open', 'true') === 'true';

        return Inertia::render('PortalSettings/Index', [
            'isOpen' => $isOpen,
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
}
