<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Services\PublicRegistrantCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class RegistrasiController extends Controller
{
    /**
     * Halaman daftar registrasi (Inertia)
     */
    public function index(): Response
    {
        $data = Registration::query()
            ->select([
                'id', 'name', 'gender', 'delegation',
                'admin_status', 'admin_reviewed_at',
                'screening_status', 'screening_reviewed_at', 'created_at',
            ])
            ->with([
                'files' => fn ($query) => $query
                    ->select(['id', 'registration_id', 'field_key'])
                    ->where('field_key', 'fotoFormal'),
            ])
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
    public function update(Request $request, string $id, PublicRegistrantCache $cache): JsonResponse
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

        $this->forgetPublicRegistrantCache($cache, $registration->id);

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Hapus registrasi (DELETE) beserta file di R2
     */
    public function destroy(string $id, PublicRegistrantCache $cache): RedirectResponse
    {
        $registration = Registration::with('files')->findOrFail($id);

        // Kumpulkan semua r2_key dari file yang terkait
        $r2Keys = $registration->files->pluck('r2_key')->toArray();

        // Hapus file fisik dari Cloudflare R2 dan Penyimpanan Lokal
        if (! empty($r2Keys)) {
            $localDeleted = Storage::disk('local')->delete($r2Keys);
            $r2Deleted = Storage::disk('r2')->delete($r2Keys);

            if (! $localDeleted || ! $r2Deleted) {
                throw new RuntimeException('Sebagian berkas pendaftar gagal dihapus dari penyimpanan.');
            }
        }

        DB::transaction(function () use ($registration): void {
            $registration->files()->delete();
            $registration->delete();
        });

        $this->forgetPublicRegistrantCache($cache, $registration->id);

        return redirect()->route('registrasi.index')->with('success', 'Data pendaftar dan berkas berhasil dihapus.');
    }

    private function forgetPublicRegistrantCache(PublicRegistrantCache $cache, string $registrationId): void
    {
        try {
            $cache->forget();
        } catch (Throwable $exception) {
            Log::warning('Cache daftar pendaftar belum dapat dibersihkan.', [
                'registration_id' => $registrationId,
                'exception' => $exception::class,
            ]);
            report($exception);
        }
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
