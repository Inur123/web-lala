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
    public function show(string $path): StreamedResponse
    {
        return $this->r2Response($path);
    }

    /**
     * Proxy publik khusus foto formal peserta.
     */
    public function photo(RegistrationFile $file): StreamedResponse
    {
        abort_unless($file->field_key === 'fotoFormal', 404);

        return $this->r2Response($file->r2_key);
    }

    private function r2Response(string $path): StreamedResponse
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('r2');

        if (! $disk->exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return $disk->response($path, null, [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
