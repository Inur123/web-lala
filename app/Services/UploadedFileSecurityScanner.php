<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use RuntimeException;

class UploadedFileSecurityScanner
{
    /**
     * @param  array<int, string>  $allowedMimeTypes
     */
    public function validate(UploadedFile $file, array $allowedMimeTypes): ?string
    {
        if (! $file->isValid()) {
            return 'Berkas gagal diunggah dengan benar.';
        }

        $path = $file->getRealPath();
        $mimeType = (string) $file->getMimeType();

        if ($path === false || ! in_array($mimeType, $allowedMimeTypes, true)) {
            return 'Isi berkas tidak sesuai dengan format yang diizinkan.';
        }

        $signatureError = $this->validateSignature($path, $mimeType);

        if ($signatureError !== null) {
            return $signatureError;
        }

        if (! config('malware.enabled')) {
            return config('malware.required')
                ? 'Pemindai keamanan berkas sedang tidak tersedia.'
                : null;
        }

        return $this->scanWithClamAv($path);
    }

    private function validateSignature(string $path, string $mimeType): ?string
    {
        if ($mimeType === 'application/pdf') {
            $handle = fopen($path, 'rb');

            if ($handle === false) {
                return 'Berkas tidak dapat diperiksa.';
            }

            try {
                $signature = fread($handle, 5);
            } finally {
                fclose($handle);
            }

            return $signature === '%PDF-'
                ? null
                : 'Isi PDF tidak valid atau telah dimanipulasi.';
        }

        if (in_array($mimeType, ['image/jpeg', 'image/png'], true)) {
            $imageInfo = @getimagesize($path);

            if ($imageInfo === false || $imageInfo['mime'] !== $mimeType) {
                return 'Isi gambar tidak valid atau telah dimanipulasi.';
            }
        }

        return null;
    }

    private function scanWithClamAv(string $path): ?string
    {
        $errorCode = 0;
        $errorMessage = '';
        $socket = @fsockopen(
            (string) config('malware.host'),
            (int) config('malware.port'),
            $errorCode,
            $errorMessage,
            (float) config('malware.timeout'),
        );

        if ($socket === false) {
            return 'Pemindai keamanan berkas sedang tidak tersedia.';
        }

        $file = fopen($path, 'rb');

        if ($file === false) {
            fclose($socket);

            return 'Berkas tidak dapat diperiksa.';
        }

        try {
            stream_set_timeout($socket, (int) config('malware.timeout'));
            $this->writeAll($socket, "zINSTREAM\0");

            while (! feof($file)) {
                $chunk = fread($file, 8192);

                if ($chunk === false) {
                    throw new RuntimeException('Berkas tidak dapat dibaca oleh pemindai.');
                }

                if ($chunk !== '') {
                    $this->writeAll($socket, pack('N', strlen($chunk)).$chunk);
                }
            }

            $this->writeAll($socket, pack('N', 0));
            $response = stream_get_contents($socket);
        } catch (RuntimeException) {
            return 'Pemindai keamanan berkas sedang tidak tersedia.';
        } finally {
            fclose($file);
            fclose($socket);
        }

        if (! is_string($response)) {
            return 'Pemindai keamanan berkas sedang tidak tersedia.';
        }

        if (str_contains($response, 'FOUND')) {
            return 'Berkas ditolak karena terdeteksi berbahaya.';
        }

        return str_contains($response, 'OK')
            ? null
            : 'Pemindai keamanan berkas sedang tidak tersedia.';
    }

    /**
     * @param  resource  $stream
     */
    private function writeAll($stream, string $payload): void
    {
        $offset = 0;
        $length = strlen($payload);

        while ($offset < $length) {
            $written = fwrite($stream, substr($payload, $offset));

            if ($written === false || $written === 0) {
                throw new RuntimeException('Koneksi ke pemindai keamanan terputus.');
            }

            $offset += $written;
        }
    }
}
