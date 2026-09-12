import { Head, Link } from '@inertiajs/react';
import {
    Users,
    CheckCircle2,
    ClipboardList,
    UserCheck,
    Settings,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type RegFile = {
    field_key: string;
    file_name: string;
    r2_key: string;
};

type Registrant = {
    id: string;
    name: string;
    gender: string;
    delegation: string;
    admin_status: 'pending' | 'lolos' | 'ditolak';
    screening_status: 'pending' | 'lolos' | 'ditolak';
    created_at: string;
    files?: RegFile[];
};

export default function Dashboard({
    registrants,
    registrationOpen,
}: {
    registrants: Registrant[];
    registrationOpen: boolean;
}) {
    const data = registrants;

    const totalPendaftar = data.length;
    const adminLolos = data.filter((r) => r.admin_status === 'lolos').length;
    const adminDitolak = data.filter(
        (r) => r.admin_status === 'ditolak',
    ).length;
    const adminPending = data.filter(
        (r) => r.admin_status === 'pending',
    ).length;

    const screeningLolos = data.filter(
        (r) => r.screening_status === 'lolos',
    ).length;
    const screeningDitolak = data.filter(
        (r) => r.screening_status === 'ditolak',
    ).length;
    const screeningPending = data.filter(
        (r) => r.admin_status === 'lolos' && r.screening_status === 'pending',
    ).length;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex w-full flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-800">
                            Dashboard Utama
                        </h1>
                        <p className="mt-0.5 text-xs font-semibold text-gray-400">
                            Selamat datang di Admin Portal LATIN & LATPEL PC
                            IPNU IPPNU Magetan 2026.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">
                            Status Pendaftaran:
                        </span>
                        {registrationOpen ? (
                            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 font-bold text-emerald-700 hover:bg-emerald-50/80">
                                DIBUKA
                            </Badge>
                        ) : (
                            <Badge
                                variant="destructive"
                                className="rounded-full border border-red-200 bg-red-50 px-3 font-bold text-red-700 hover:bg-red-50/80"
                            >
                                DITUTUP
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Total Pendaftar
                            </CardTitle>
                            <Users className="h-4 w-4 text-[#1a4d2e]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-800">
                                {totalPendaftar}
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#1a4d2e]">
                                <TrendingUp className="h-3 w-3" />
                                <span>Semua berkas masuk</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Administrasi Lolos
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-800">
                                {adminLolos}
                            </div>
                            <p className="mt-1 text-[10px] font-semibold text-gray-400">
                                {adminPending} menunggu, {adminDitolak} ditolak
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Screening Lolos
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-800">
                                {screeningLolos}
                            </div>
                            <p className="mt-1 text-[10px] font-semibold text-gray-400">
                                {screeningPending} menunggu, {screeningDitolak}{' '}
                                ditolak
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Belum Direview
                            </CardTitle>
                            <ClipboardList className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-800">
                                {adminPending + screeningPending}
                            </div>
                            <p className="mt-1 text-[10px] font-semibold text-gray-400">
                                Memerlukan review segera
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Registrants */}
                    <Card className="col-span-4 rounded-2xl border border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-black text-gray-800">
                                Pendaftar Terbaru
                            </CardTitle>
                            <CardDescription className="text-[10px] font-semibold text-gray-400">
                                Berikut adalah 5 calon peserta yang mendaftar
                                paling baru ke sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.length === 0 ? (
                                    <p className="py-8 text-center text-xs font-semibold text-gray-400">
                                        Belum ada peserta terdaftar.
                                    </p>
                                ) : (
                                    data.slice(0, 5).map((reg) => (
                                        <div
                                            key={reg.id}
                                            className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-xs leading-none font-bold text-gray-800">
                                                    {reg.name}
                                                </p>
                                                <p className="text-[10px] font-semibold text-gray-400">
                                                    {reg.delegation}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge
                                                    className={`rounded border px-2 py-0.5 text-[9px] font-bold ${
                                                        reg.admin_status ===
                                                        'lolos'
                                                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                                            : reg.admin_status ===
                                                                'ditolak'
                                                              ? 'border-red-100 bg-red-50 text-red-600'
                                                              : 'border-amber-100 bg-amber-50 text-amber-600'
                                                    }`}
                                                >
                                                    Adm:{' '}
                                                    {reg.admin_status.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shortcuts / Quick Actions */}
                    <Card className="col-span-3 flex flex-col justify-between rounded-2xl border border-gray-100 shadow-sm">
                        <div>
                            <CardHeader>
                                <CardTitle className="text-sm font-black text-gray-800">
                                    Aksi Cepat Admin
                                </CardTitle>
                                <CardDescription className="text-[10px] font-semibold text-gray-400">
                                    Pintasan navigasi untuk mengelola seleksi
                                    peserta dan sistem.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link
                                    href="/registrasi"
                                    className="block w-full"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full cursor-pointer justify-start rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                        <ClipboardList className="mr-2 h-4 w-4 text-[#1a4d2e]" />
                                        Seleksi Administrasi & Screening
                                        <ArrowRight className="ml-auto h-3 w-3 text-gray-400" />
                                    </Button>
                                </Link>
                                <Link
                                    href="/portal-settings"
                                    className="block w-full"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full cursor-pointer justify-start rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                        <Settings className="mr-2 h-4 w-4 text-[#1a4d2e]" />
                                        Buka / Tutup Pendaftaran
                                        <ArrowRight className="ml-auto h-3 w-3 text-gray-400" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="rounded-xl border border-gray-100/50 bg-gray-50/50 p-3 text-[10px] leading-relaxed font-semibold text-gray-400">
                                Pastikan Anda meninjau berkas administrasi
                                (sertifikat, rekomendasi, dll) dengan teliti
                                sebelum meloloskan calon peserta.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
