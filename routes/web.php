<?php

use App\Http\Controllers\Admin\RegistrasiController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;

// ─── Publik ───────────────────────────────────────────────────────
Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/pendaftar', [PublicController::class, 'pendaftar'])->name('pendaftar');
Route::get('/register', [RegisterController::class, 'create'])->name('register');
Route::post('/register', [RegisterController::class, 'store'])
    ->middleware('throttle:registration')
    ->name('register.store');

// File proxy publik hanya untuk foto formal peserta.
Route::get('/participant-photos/{file}', [FileController::class, 'photo'])->name('files.photo');

// API Publik (JSON)
Route::get('/api/public/registrants', [PublicController::class, 'registrantsJson']);
Route::get('/api/public/settings', [PublicController::class, 'settingsJson']);

// ─── Dashboard (Auth Required) ───────────────────────────────────
Route::middleware('auth')->group(function () {
    // Dokumen pendaftaran lainnya hanya dapat dibaca admin.
    Route::get('/files/{file}', [FileController::class, 'show'])->name('files.show');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Registrasi
    Route::get('/registrasi', [RegistrasiController::class, 'index'])->name('registrasi.index');
    Route::get('/registrasi/{id}', [RegistrasiController::class, 'show'])->name('registrasi.show');
    Route::patch('/registrasi/{id}', [RegistrasiController::class, 'update'])->name('registrasi.update');
    Route::delete('/registrasi/{id}', [RegistrasiController::class, 'destroy'])->name('registrasi.destroy');

    // Settings (Admin Custom)
    Route::get('/portal-settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/portal-settings', [SettingsController::class, 'update'])->name('settings.update');

    // API Admin (JSON)
    Route::get('/api/admin/registrasi', [RegistrasiController::class, 'apiIndex']);
    Route::get('/api/admin/settings', [SettingsController::class, 'apiIndex']);
});

require __DIR__.'/settings.php';
