<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $message = 'Status berhasil diperbarui.';

        if ($stage === 'admin') {
            $wasRejected = $registration->admin_status === 'ditolak';
            $registration->update([
                'admin_status' => $status,
                'admin_reviewed_at' => now(),
            ]);

            if ($status === 'ditolak') {
                $message = 'Administrasi ditolak dan screening otomatis ditolak.';
            } elseif ($wasRejected) {
                $message = 'Administrasi diterima dan screening dikembalikan ke status menunggu.';
            } else {
                $message = 'Peserta lolos seleksi administrasi.';
            }
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
            $message = $status === 'lolos'
                ? 'Peserta lolos tahap screening.'
                : 'Peserta ditolak pada tahap screening.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Hapus registrasi (DELETE) beserta file di R2
     */
    public function destroy(string $id): RedirectResponse
    {
        $registration = Registration::with('files')->findOrFail($id);

        // Kumpulkan semua r2_key dari file yang terkait
        $r2Keys = $registration->files->pluck('r2_key')->toArray();

        // Hapus file fisik dari Cloudflare R2
        if (!empty($r2Keys)) {
            Storage::disk('r2')->delete($r2Keys);
        }

        // Hapus record pendaftaran (file akan terhapus otomatis jika ada cascade, tapi kita hapus manual record filenya dulu biar aman)
        $registration->files()->delete();
        $registration->delete();

        return redirect()->route('registrasi.index')->with('success', 'Data pendaftar dan berkas berhasil dihapus.');
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
