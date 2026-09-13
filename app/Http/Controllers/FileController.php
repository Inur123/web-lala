<?php

namespace App\Http\Controllers;

use App\Models\RegistrationFile;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    /**
     * Proxy file dari Cloudflare R2
     */
    public function show(RegistrationFile $file): StreamedResponse
    {
        return $this->r2Response($file->r2_key, 'private, max-age=300');
    }

    /**
     * Proxy publik khusus foto formal peserta.
     */
    public function photo(RegistrationFile $file): StreamedResponse
    {
        abort_unless($file->field_key === 'fotoFormal', 404);

        return $this->r2Response($file->r2_key, 'public, max-age=86400');
    }

    private function r2Response(string $path, string $cacheControl): StreamedResponse
    {
        // Cek dulu apakah file masih ada di server lokal (sedang dalam antrean upload)
        if (Storage::disk('local')->exists($path)) {
            /** @var FilesystemAdapter $localDisk */
            $localDisk = Storage::disk('local');

            return $localDisk->response($path, null, [
                'Cache-Control' => $cacheControl,
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('r2');

        if (! $disk->exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return $disk->response($path, null, [
            'Cache-Control' => $cacheControl,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
