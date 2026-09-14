<?php

use App\Http\Controllers\Admin\AttendanceScanController;
use App\Http\Controllers\Admin\AttendanceSessionController;
use App\Http\Controllers\Admin\SeleksiController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login.store');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

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

    // Seleksi (dulunya Registrasi)
    Route::get('/seleksi', [SeleksiController::class, 'index'])->name('seleksi.index');
    Route::get('/seleksi/download-qr-all', [SeleksiController::class, 'downloadAllQr'])->name('seleksi.download-qr-all');
    Route::get('/seleksi/{id}', [SeleksiController::class, 'show'])->name('seleksi.show');
    Route::patch('/seleksi/{id}', [SeleksiController::class, 'update'])->name('seleksi.update');
    Route::delete('/seleksi/{id}', [SeleksiController::class, 'destroy'])->name('seleksi.destroy');

    // Settings (Admin Custom)
    Route::get('/portal-settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/portal-settings', [SettingsController::class, 'update'])->name('settings.update');

    // Absensi
    Route::get('/absensi', [AttendanceSessionController::class, 'index'])->name('admin.absensi.index');
    Route::post('/absensi', [AttendanceSessionController::class, 'store'])->name('admin.absensi.store');
    Route::get('/absensi/{absensi}', [AttendanceSessionController::class, 'show'])->name('admin.absensi.show');
    Route::get('/absensi/{absensi}/scan', [AttendanceSessionController::class, 'scanner'])->name('admin.absensi.scanner');
    Route::post('/absensi/{absensi}/scan', [AttendanceScanController::class, 'store'])
        ->middleware('throttle:attendance-scan')
        ->name('admin.absensi.scan');
    Route::delete('/absensi/{absensi}', [AttendanceSessionController::class, 'destroy'])->name('admin.absensi.destroy');

    // API Admin (JSON)
    Route::get('/api/admin/settings', [SettingsController::class, 'apiIndex']);
});

require __DIR__.'/settings.php';
