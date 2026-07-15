export const NAV_LINKS = [
  { label: "Tentang", href: "#tentang" },
  { label: "Timeline", href: "#alur" },
  { label: "Persyaratan", href: "#persyaratan" },
  { label: "Fasilitas", href: "#fasilitas" },
  { label: "Pendaftar", href: "/pendaftar" },
] as const;

// ─── Hero ───────────────────────────────────────────────────────────────────────
export const HERO_BADGE = "REGISTRASI CALON INSTRUKTUR & PELATIH";

export const HERO_SUBTITLE =
  "Episentrum Kaderisasi : Orkestrasi Gerakan Inklusif, Wujudkan Instruktur-Pelatih yang Solutif-Transformatif";

// ─── Event Info ────────────────────────────────────────────────────────────────
export const EVENT_INFO = [
  {
    id: "date",
    label: "TANGGAL KEGIATAN",
    value: "12 - 15 Juni 2026",
  },
  {
    id: "location",
    label: "LOKASI / VENUE",
    value: "PonPes Al-Muttaqin Karas",
  },
  {
    id: "quota",
    label: "TARGET PESERTA",
    value: "20 Peserta Pilihan",
  },
] as const;

// ─── Why Section ───────────────────────────────────────────────────────────────
export const WHY_STATS = [
  {
    id: "program",
    category: "NAMA PROGRAM",
    title: "Latihan Instruktur & Latihan Pelatih",
    description: "LATIN & LATPEL",
  },
  {
    id: "focus",
    category: "FOKUS UTAMA",
    title: "Mencetak Instruktur Pelatih Militan",
    description: "Militan",
  },
  {
    id: "organizer",
    category: "PENYELENGGARA",
    title: "Departemen Kaderisasi PC IPNU IPPNU",
    description: "PC IPNU IPPNU",
  },
] as const;

// ─── Timeline / Alur ───────────────────────────────────────────────────────────────
export const TIMELINE_STEPS = [
  { date: "03 MEI 2026", label: "Sosialisasi & Pengumuman" },
  { date: "03-24 MEI 26", label: "Pendaftaran" },
  { date: "25 MEI 2026", label: "Screening Berkas" },
  { date: "29 MEI 2026", label: "Hasil Berkas" },
  { date: "31 MEI 2026", label: "Wawancara" },
  { date: "05 JUNI 2026", label: "Penetapan" },
  { date: "08 JUNI 2026", label: "TM & PKD" },
  { date: "12-15 JUNI 26", label: "Forum Utama" },
  { date: "01 JUL - 09 NOV", label: "Evaluasi & RTL" },
] as const;

// ─── Registration & Requirements ────────────────────────────────────────────────
export const ADMIN_REQUIREMENTS = [
  {
    title: "Sertifikat MAKESTA",
    desc: "Sertifikat kelulusan jenjang kaderisasi pertama MAKESTA.",
  },
  {
    title: "Sertifikat LAKMUD",
    desc: "Sertifikat kelulusan jenjang kaderisasi LAKMUD (jika ada).",
  },
  {
    title: "KTP / KTA",
    desc: "KTP atau Kartu Tanda Anggota (KTA) membuktikan usia 17-23 tahun.",
  },
  {
    title: "Surat Rekomendasi",
    desc: "Surat rekomendasi dari PAC (Internal) atau PC (Eksternal).",
  },
  {
    title: "Pakta Integritas",
    desc: "Pakta kesediaan bermaterai 10.000 yang ditandatangani.",
  },
  {
    title: "Karya Tulis Essay",
    desc: "Essay 750-1000 kata mengenai tema pilihan.",
  },
  {
    title: "Formulir Pendaftaran",
    desc: "Formulir pendaftaran resmi yang telah diisi lengkap.",
  },
  {
    title: "Foto Formal Jas Merah",
    desc: "Foto formal terbaru menggunakan jas IPNU/IPPNU background merah.",
  },
  {
    title: "Bukti Bayar Kontribusi",
    desc: "Bukti transfer pembayaran registrasi dan kontribusi.",
  },
] as const;

export const TICKET_PRICES = [
  { label: "Registrasi Awal", price: "Rp 50.000" },
  { label: "Kontribusi Internal", price: "Rp 200.000" },
  { label: "Kontribusi Eksternal", price: "Rp 250.000" },
] as const;

export const FACILITIES = [
  "Ruangan Forum Kondusif",
  "Materi & Modul Pelatihan",
  "Lanyard & Book Note Eksklusif",
  "Kaos Resmi Pelatihan",
  "Sertifikat Kelulusan Resmi",
  "Konsumsi & Kopi Rutin",
] as const;

export const CONTACT_INFO = {
  address: "Jl. MT. Haryono, No. 9 Magetan, Jawa Timur",
  phone: [
    { name: "CP 1: Narahubung", number: "0857-0883-7146" },
    { name: "CP 2: Narahubung", number: "0857-9086-5350" },
  ],
  email: "pelajarnumagetan@gmail.com",
} as const;
