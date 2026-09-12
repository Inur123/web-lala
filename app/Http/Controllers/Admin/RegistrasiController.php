<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrasiController extends Controller
{
    /**
     * Halaman daftar registrasi (Inertia)
     */
    public function index(): Response
    {
        $data = Registration::with('files')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Registrasi/Index', [
            'registrants' => $data,
        ]);
    }

    /**
     * Halaman detail registrasi (Inertia)
     */
    public function show(string $id): Response
    {
        $registrant = Registration::with('files')->findOrFail($id);

        return Inertia::render('Registrasi/Show', [
            'registrant' => $registrant,
        ]);
    }

    /**
     * Update status seleksi (PATCH)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'stage' => 'required|in:admin,screening',
            'status' => 'required|in:lolos,ditolak',
        ]);

        $registration = Registration::findOrFail($id);
        $stage = $request->input('stage');
        $status = $request->input('status');

        if ($stage === 'admin') {
            $registration->update([
                'admin_status' => $status,
                'admin_reviewed_at' => now(),
            ]);
        } elseif ($stage === 'screening') {
            // Screening hanya bisa jika admin sudah lolos
            if ($registration->admin_status !== 'lolos') {
                return response()->json([
                    'error' => 'Peserta harus lolos administrasi terlebih dahulu.',
                ], 400);
            }
            $registration->update([
                'screening_status' => $status,
                'screening_reviewed_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui.',
        ]);
    }

    /**
     * API: List semua registrasi (JSON) untuk backward compat
     */
    public function apiIndex(): JsonResponse
    {
        $data = Registration::with('files')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $data]);
    }
}
