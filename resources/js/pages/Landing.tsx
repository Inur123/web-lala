import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Users,
    BookOpen,
    CalendarClock,
    ChevronRight,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Building2,
    PenTool,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white selection:bg-[#1a4d2e] selection:text-white">
            <Head title="LATIN & LATPEL 2026 - IPNU IPPNU Magetan" />

            {/* Navbar */}
            <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/80 py-4 backdrop-blur-md">
                <div className="container mx-auto flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <AppLogoIcon className="h-8 w-8 text-[#1a4d2e]" />
                        <span className="text-lg font-black tracking-tight text-gray-900">
                            PC IPNU IPPNU{' '}
                            <span className="text-[#1a4d2e]">MAGETAN</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/pendaftar"
                            className="hidden text-sm font-bold text-gray-500 transition-colors hover:text-[#1a4d2e] md:block"
                        >
                            Cek Data Pendaftar
                        </Link>
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="text-sm font-bold text-gray-700"
                            >
                                Login Admin
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="rounded-full bg-[#1a4d2e] px-6 text-xs font-bold shadow-sm hover:bg-[#123620]">
                                Daftar Sekarang{' '}
                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-white to-white"></div>

                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center rounded-full border border-green-200 bg-green-50/50 px-3 py-1 text-xs font-bold text-green-700 backdrop-blur-sm">
                            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                            Pendaftaran Resmi Dibuka
                        </div>

                        <h1 className="mb-6 text-5xl leading-tight font-black tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                            Latihan Instruktur &{' '}
                            <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-[#1a4d2e] to-emerald-500 bg-clip-text text-transparent">
                                Latihan Pelatih 2026
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed font-medium text-gray-500">
                            Persiapkan diri Anda untuk menjadi instruktur dan
                            pelatih terbaik di Pimpinan Cabang IPNU IPPNU
                            Kabupaten Magetan.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-14 w-full rounded-full bg-[#1a4d2e] px-8 text-base font-bold shadow-lg shadow-green-900/20 hover:bg-[#123620] sm:w-auto"
                                >
                                    Mulai Pendaftaran{' '}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#informasi">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 w-full rounded-full border-2 px-8 text-base font-bold text-gray-700 sm:w-auto"
                                >
                                    Baca Persyaratan
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Cards */}
            <section id="informasi" className="bg-gray-50 py-20">
                <div className="container mx-auto px-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                icon: CalendarClock,
                                title: 'Waktu Pelaksanaan',
                                desc: 'Acara akan dilaksanakan pada 15-18 Agustus 2026. Persiapkan diri Anda sebaik mungkin.',
                            },
                            {
                                icon: MapPin,
                                title: 'Lokasi Kegiatan',
                                desc: 'Pondok Pesantren Al-Fatah, Temboro, Kabupaten Magetan, Jawa Timur.',
                            },
                            {
                                icon: Users,
                                title: 'Peserta Terbatas',
                                desc: 'Kuota terbatas untuk delegasi terbaik dari tiap Pimpinan Anak Cabang se-Magetan.',
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#1a4d2e] transition-colors group-hover:bg-[#1a4d2e] group-hover:text-white">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed font-medium text-gray-500">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Persyaratan Berkas */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                Persyaratan Berkas <br />
                                <span className="text-[#1a4d2e]">
                                    Wajib Disiapkan
                                </span>
                            </h2>
                            <p className="mb-8 text-lg font-medium text-gray-500">
                                Pastikan Anda telah menyiapkan scan/foto dokumen
                                asli berikut dalam format PDF atau gambar yang
                                jelas (maks. 10MB per file).
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    'Sertifikat MAKESTA',
                                    'Sertifikat LAKMUD',
                                    'Surat Rekomendasi PAC',
                                    'Essay Karya Tulis',
                                    'Scan KTP / KTA',
                                    'Formulir Pendaftaran',
                                    'Pakta Integritas (Materai)',
                                    'Foto Formal Berjas Merah',
                                    'Bukti Transfer Biaya',
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Link href="/register">
                                    <Button className="rounded-xl bg-[#1a4d2e] px-6 text-sm font-bold shadow-md hover:bg-[#123620]">
                                        Daftar Sekarang{' '}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-green-100 to-green-50 opacity-50 blur-2xl"></div>
                            <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                                            <Building2 className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">
                                                1. Seleksi Administrasi
                                            </h4>
                                            <p className="mt-1 text-sm font-medium text-gray-500">
                                                Panitia akan memverifikasi
                                                kelengkapan berkas yang Anda
                                                unggah. Hasil akan diumumkan di
                                                web.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                                            <PenTool className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">
                                                2. Wawancara / Screening
                                            </h4>
                                            <p className="mt-1 text-sm font-medium text-gray-500">
                                                Bagi yang lolos administrasi,
                                                akan dihubungi untuk mengikuti
                                                tes wawancara dan screening
                                                hafalan.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                                            <BookOpen className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">
                                                3. Pelaksanaan Kegiatan
                                            </h4>
                                            <p className="mt-1 text-sm font-medium text-gray-500">
                                                Peserta yang lolos final wajib
                                                mengikuti seluruh rangkaian
                                                kegiatan dari awal hingga akhir.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <div className="mb-6 flex justify-center">
                        <AppLogoIcon className="h-10 w-10 text-gray-300 grayscale" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">
                        © 2026 PC IPNU IPPNU Kabupaten Magetan. All rights
                        reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
