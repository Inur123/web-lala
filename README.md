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
  <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-11-FF2D20.svg?style=flat&logo=laravel&logoColor=white" alt="Laravel" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://inertiajs.com/"><img src="https://img.shields.io/badge/Inertia.js-3-9553E9.svg?style=flat&logo=inertia&logoColor=white" alt="Inertia" /></a>
</div>

---

## 📖 Tentang Sistem

Sistem ini adalah portal pendaftaran *Single Page Application* (SPA) yang dirancang khusus untuk memfasilitasi proses rekrutmen peserta pelatihan kader instruktur (LATIN) dan pelatih (LATPEL) PC IPNU IPPNU Kabupaten Magetan tahun 2026. 

Sistem ini memastikan pengumpulan data peserta, unggahan berkas administratif, hingga proses *screening* berjalan secara terpusat, modern, dan sangat cepat tanpa adanya *page reload*.

🔗 **URL Resmi:** [lala.pelajarnumagetan.or.id](https://lala.pelajarnumagetan.or.id)

---

## ✨ Fitur Utama

- **Pendaftaran Tanpa Reload (SPA):** Formulir pendaftaran menggunakan arsitektur SPA yang memberikan pengalaman pengguna sangat halus dan responsif.
- **Validasi Keamanan Ekstra:** Dilengkapi dengan perlindungan anti-spam melalui **Cloudflare Turnstile** dan validasi *strict* untuk mencegah injeksi karakter berbahaya.
- **Notifikasi Email Otomatis:** Sistem akan secara otomatis mengirimkan email konfirmasi resmi beserta tautan grup WhatsApp melalui sistem antrian (*queue* di latar belakang).
- **Penyimpanan Berkas Terdistribusi:** Semua unggahan berkas (PDF, Foto) langsung diunggah dengan aman menuju **Cloudflare R2 Storage (S3 API)**.
- **Dashboard Admin Interaktif:** 
  - Panel keputusan (Terima/Tolak) untuk tahap **Administrasi** dan **Screening**.
  - Manajemen pengaturan ketersediaan pendaftaran.
  - Fitur Hapus Data yang secara otomatis akan menghapus dan membersihkan *file* fisik di *cloud storage*.

---

<div align="center">
  <i>Dikembangkan oleh Departemen IT PC IPNU IPPNU Kabupaten Magetan © 2026</i>
</div>
