<div align="center">
  <img src="public/images/logo-lala.png" alt="Logo LATIN LATPEL 2026" width="150" />
</div>

<h1 align="center">Portal Pendaftaran LATIN & LATPEL 2026</h1>

<p align="center">
  Portal resmi pendaftaran Latihan Instruktur (LATIN) dan Latihan Pelatih (LATPEL) 
  <br />
  Pimpinan Cabang Ikatan Pelajar Nahdlatul Ulama & Ikatan Pelajar Putri Nahdlatul Ulama Kabupaten Magetan.
</p>

<div align="center">
  <a href="https://github.com/Inur123/web-lala/releases/tag/v1.4.0"><img src="https://img.shields.io/badge/Rilis-v1.4.0-166534.svg?style=flat" alt="Rilis v1.4.0" /></a>
  <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-13-FF2D20.svg?style=flat&logo=laravel&logoColor=white" alt="Laravel" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://inertiajs.com/"><img src="https://img.shields.io/badge/Inertia.js-3-9553E9.svg?style=flat&logo=inertia&logoColor=white" alt="Inertia" /></a>
</div>

---

## 📖 Tentang Sistem

Sistem ini adalah portal pendaftaran _Single Page Application_ (SPA) yang dirancang khusus untuk memfasilitasi proses rekrutmen peserta pelatihan kader instruktur (LATIN) dan pelatih (LATPEL) PC IPNU IPPNU Kabupaten Magetan tahun 2026.

Sistem ini memastikan pengumpulan data peserta, unggahan berkas administratif, hingga proses _screening_ berjalan secara terpusat, modern, dan sangat cepat tanpa adanya _page reload_.

🔗 **URL Resmi:** [lala.pelajarnumagetan.or.id](https://lala.pelajarnumagetan.or.id)

---

## ✨ Fitur Utama

- **Pendaftaran Tanpa Reload (SPA):** Formulir pendaftaran menggunakan arsitektur SPA yang memberikan pengalaman pengguna sangat halus dan responsif.
- **Validasi Keamanan Ekstra:** Dilengkapi dengan perlindungan anti-spam melalui **Cloudflare Turnstile** dan validasi _strict_ untuk mencegah injeksi karakter berbahaya.
- **Notifikasi Email Otomatis:** Sistem akan secara otomatis mengirimkan email konfirmasi resmi beserta tautan grup WhatsApp melalui sistem antrian (_queue_ di latar belakang).
- **Penyimpanan Berkas Terdistribusi:** Semua unggahan berkas (PDF, Foto) langsung diunggah dengan aman menuju **Cloudflare R2 Storage (S3 API)**.
- **Dashboard Admin Interaktif:**
    - Panel keputusan (Terima/Tolak) untuk tahap **Administrasi** dan **Screening**.
    - Manajemen pengaturan ketersediaan pendaftaran.
    - Fitur Hapus Data yang secara otomatis akan menghapus dan membersihkan _file_ fisik di _cloud storage_.
    - Navigasi mobile bergaya aplikasi dengan tombol Absensi utama, halaman Profil khusus, dan daftar data yang dioptimalkan untuk layar kecil.
- **Absensi QR Terintegrasi:**
    - QR unik dan aman dibuat otomatis untuk setiap peserta.
    - Hanya peserta yang lolos screening yang masuk ke daftar absensi.
    - Pemindaian dilindungi autentikasi, pembatasan laju permintaan, transaksi database, dan pencegahan pemindaian ganda.
    - Riwayat kehadiran tetap tersimpan meskipun status peserta kemudian berubah.
- **Ekspor Administrasi:** Data seleksi dapat diekspor ke Excel dan seluruh QR peserta lolos dapat diunduh sebagai satu berkas ZIP.

---

## 🚀 Rilis Saat Ini

Versi stabil terbaru adalah **v1.4.0 — Pengalaman Admin Mobile**.

Rilis ini menghadirkan layout admin khusus mobile dengan app bar ringkas dan lima navigasi utama: Dashboard, Seleksi, Absensi, Pengaturan, serta Profil. Tombol Absensi ditempatkan sebagai aksi utama di tengah, Profil membuka halaman pengaturan akun, dan seluruh dialog CRUD bergerak dari bawah pada perangkat mobile. Tabel Seleksi serta detail Absensi berubah menjadi kartu daftar pada layar kecil, sedangkan tampilan desktop dan seluruh URL tetap dipertahankan.

---

## 🧰 Teknologi

- PHP 8.3 dan Laravel 13
- React 19, TypeScript, Inertia.js 3, dan Tailwind CSS 4
- PostgreSQL untuk produksi dan SQLite untuk pengujian
- Cloudflare Turnstile dan Cloudflare R2
- shadcn/ui dan Radix UI

Ekstensi PHP `gd` dan `zip` diperlukan untuk menghasilkan gambar QR dan arsip ZIP.

---

## 💻 Menjalankan Proyek

```bash
composer install
npm ci
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
composer dev
```

Isi konfigurasi database, Cloudflare R2, email, dan Turnstile pada `.env` sebelum menjalankan integrasi terkait. Nilai rahasia tidak boleh dimasukkan ke Git.

Untuk menjalankan seluruh pemeriksaan kualitas:

```bash
composer ci:check
npm run build
```

---

<div align="center">
  <i>Dikembangkan oleh Departemen IT PC IPNU IPPNU Kabupaten Magetan © 2026</i>
</div>
