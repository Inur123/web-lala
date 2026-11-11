<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Inertia\Inertia;
use Inertia\Response;

class PesertaController extends Controller
{
    /**
     * Tampilkan daftar peserta yang lolos seleksi administrasi.
     */
    public function administrasi(): Response
    {
        $registrants = Registration::query()
            ->where('admin_status', 'lolos')
            ->select([
                'id',
                'name',
                'gender',
                'shirt_size',
                'delegation',
                'whatsapp',
                'email',
                'birth_date',
                'admin_reviewed_at',
                'created_at',
            ])
            ->with([
                'files' => fn ($query) => $query
                    ->select(['id', 'registration_id', 'field_key'])
                    ->where('field_key', 'fotoFormal'),
            ])
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Peserta/Administrasi', [
            'registrants' => $registrants,
        ]);
    }

    /**
     * Tampilkan daftar peserta yang lolos seleksi screening (peserta resmi).
     */
    public function screening(): Response
    {
        $registrants = Registration::query()
            ->where('admin_status', 'lolos')
            ->where('screening_status', 'lolos')
            ->select([
                'id',
                'name',
                'gender',
                'shirt_size',
                'delegation',
                'whatsapp',
                'email',
                'birth_date',
                'screening_reviewed_at',
                'created_at',
            ])
            ->with([
                'files' => fn ($query) => $query
                    ->select(['id', 'registration_id', 'field_key'])
                    ->where('field_key', 'fotoFormal'),
            ])
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Peserta/Screening', [
            'registrants' => $registrants,
        ]);
    }
}
