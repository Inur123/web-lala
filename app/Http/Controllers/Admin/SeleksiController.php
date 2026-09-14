<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Services\AttendanceRoster;
use App\Services\PublicRegistrantCache;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;
use GdImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;
use ZipArchive;

class SeleksiController extends Controller
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

        return Inertia::render('Seleksi/Index', [
            'registrants' => $data,
        ]);
    }

    /**
     * Halaman detail registrasi (Inertia)
     */
    public function show(string $id): Response
    {
        $registrant = Registration::with('files')->findOrFail($id);

        return Inertia::render('Seleksi/Show', [
            'registrant' => $registrant,
        ]);
    }

    /**
     * Update status seleksi (PATCH)
     */
    public function update(
        Request $request,
        string $id,
        PublicRegistrantCache $cache,
        AttendanceRoster $roster,
    ): JsonResponse {
        $validated = $request->validate([
            'stage' => 'required|in:admin,screening',
            'status' => 'required|in:lolos,ditolak',
        ]);

        /** @var array{stage: 'admin'|'screening', status: 'lolos'|'ditolak'} $validated */
        [$registration, $message, $error] = DB::transaction(function () use ($id, $roster, $validated): array {
            $registration = Registration::query()->lockForUpdate()->findOrFail($id);
            $message = 'Status berhasil diperbarui.';

            if ($validated['stage'] === 'admin') {
                $wasRejected = $registration->admin_status === 'ditolak';
                $registration->update([
                    'admin_status' => $validated['status'],
                    'admin_reviewed_at' => now(),
                ]);

                if ($validated['status'] === 'ditolak') {
                    $message = 'Administrasi ditolak dan screening otomatis ditolak.';
                } elseif ($wasRejected) {
                    $message = 'Administrasi diterima dan screening dikembalikan ke status menunggu.';
                } else {
                    $message = 'Peserta lolos seleksi administrasi.';
                }
            } elseif ($registration->admin_status !== 'lolos') {
                return [
                    $registration,
                    $message,
                    'Peserta harus lolos administrasi terlebih dahulu.',
                ];
            } else {
                $registration->update([
                    'screening_status' => $validated['status'],
                    'screening_reviewed_at' => now(),
                ]);
                $message = $validated['status'] === 'lolos'
                    ? 'Peserta lolos tahap screening.'
                    : 'Peserta ditolak pada tahap screening.';
            }

            $roster->syncRegistration($registration);

            return [$registration, $message, null];
        }, 3);

        if ($error !== null) {
            return response()->json(['error' => $error], 400);
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

        return redirect()->route('seleksi.index')->with('success', 'Data pendaftar dan berkas berhasil dihapus.');
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
     * Download all QR Codes for participants who passed screening as a ZIP archive
     */
    public function downloadAllQr(): BinaryFileResponse|RedirectResponse
    {
        $participants = Registration::query()
            ->select(['name', 'delegation', 'qr_token'])
            ->where('screening_status', 'lolos')
            ->orderBy('name')
            ->get();

        if ($participants->isEmpty()) {
            return back()->with('error', 'Belum ada peserta yang lolos screening.');
        }

        $zipFileName = 'QR_Peserta_Lolos_LATIN_LATPEL_2026.zip';
        $tempZipPath = tempnam(sys_get_temp_dir(), 'qr_zip_');
        if ($tempZipPath === false) {
            throw new RuntimeException('Gagal menyiapkan file ZIP sementara.');
        }

        $zip = new ZipArchive;
        $zipIsOpen = false;

        try {
            if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new RuntimeException('Gagal membuat file ZIP.');
            }
            $zipIsOpen = true;

            foreach ($participants as $index => $participant) {
                $qrPng = $this->generateHighResQrPng($participant->qr_token);
                $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $participant->name) ?: 'peserta';
                $safeDelegation = preg_replace('/[^a-zA-Z0-9_-]/', '_', $participant->delegation) ?: 'delegasi';
                $fileNum = str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
                $entryName = "{$fileNum}_{$safeName}_{$safeDelegation}.png";

                if (! $zip->addFromString($entryName, $qrPng)) {
                    throw new RuntimeException("Gagal menambahkan QR {$participant->name} ke ZIP.");
                }
            }

            if (! $zip->close()) {
                throw new RuntimeException('Gagal menyelesaikan file ZIP.');
            }
            $zipIsOpen = false;

            return response()->download($tempZipPath, $zipFileName, [
                'Content-Type' => 'application/zip',
            ])->deleteFileAfterSend(true);
        } catch (Throwable $exception) {
            if ($zipIsOpen) {
                $zip->close();
            }
            File::delete($tempZipPath);
            report($exception);

            return back()->with('error', 'File ZIP QR belum dapat dibuat. Silakan coba lagi.');
        }
    }

    /**
     * Generate a crisp, high-resolution PNG containing ONLY the QR code (no text)
     */
    private function generateHighResQrPng(string $token): string
    {
        $qr = Encoder::encode($token, ErrorCorrectionLevel::H(), 'UTF-8');
        $matrix = $qr->getMatrix();
        $matrixWidth = $matrix->getWidth();
        $matrixHeight = $matrix->getHeight();

        $imgSize = 1000;
        $image = imagecreatetruecolor($imgSize, $imgSize);

        if (! $image instanceof GdImage) {
            throw new RuntimeException('Gagal membuat kanvas QR.');
        }

        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);

        if ($white === false || $black === false) {
            throw new RuntimeException('Gagal menyiapkan warna QR.');
        }

        imagefilledrectangle($image, 0, 0, $imgSize, $imgSize, $white);

        $margin = 80;
        $qrSize = $imgSize - (2 * $margin);
        $scale = $qrSize / $matrixWidth;

        for ($y = 0; $y < $matrixHeight; $y++) {
            for ($x = 0; $x < $matrixWidth; $x++) {
                if ($matrix->get($x, $y) === 1) {
                    $x1 = (int) round($margin + ($x * $scale));
                    $y1 = (int) round($margin + ($y * $scale));
                    $x2 = (int) round($margin + (($x + 1) * $scale));
                    $y2 = (int) round($margin + (($y + 1) * $scale));
                    imagefilledrectangle($image, $x1, $y1, $x2, $y2, $black);
                }
            }
        }

        ob_start();
        $written = imagepng($image, null, 9);
        $pngData = ob_get_clean();
        imagedestroy($image);

        if (! $written || $pngData === false) {
            throw new RuntimeException('Gagal menghasilkan gambar QR.');
        }

        return $pngData;
    }
}
