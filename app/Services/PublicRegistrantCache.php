<?php

namespace App\Services;

use App\Models\Registration;
use Illuminate\Support\Facades\Cache;

class PublicRegistrantCache
{
    private const CACHE_KEY = 'public-registrants:v1';

    /**
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, now()->addMinute(), function (): array {
            return Registration::query()
                ->select([
                    'id', 'name', 'gender', 'delegation',
                    'admin_status', 'screening_status', 'created_at',
                ])
                ->with([
                    'files' => fn ($query) => $query
                        ->select(['id', 'registration_id'])
                        ->where('field_key', 'fotoFormal'),
                ])
                ->latest()
                ->get()
                ->map(function (Registration $registration): array {
                    $photo = $registration->files->first();

                    return [
                        'id' => $registration->id,
                        'name' => $registration->name,
                        'gender' => $registration->gender,
                        'delegation' => $registration->delegation,
                        'adminStatus' => $registration->admin_status,
                        'screeningStatus' => $registration->screening_status,
                        'photoUrl' => $photo
                            ? route('files.photo', ['file' => $photo->id], absolute: false)
                            : null,
                    ];
                })
                ->all();
        });
    }

    public function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
