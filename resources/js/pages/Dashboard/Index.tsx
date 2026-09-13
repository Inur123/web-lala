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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type Registrant = {
    id: string;
    name: string;
    gender: string;
    delegation: string;
    admin_status: 'pending' | 'lolos' | 'ditolak';
    screening_status: 'pending' | 'lolos' | 'ditolak';
    created_at: string;
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

            <div className="flex w-full flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                            Dashboard Utama
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Selamat datang di Admin Portal LATIN & LATPEL PC
                            IPNU IPPNU Magetan 2026.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                            Status Pendaftaran:
                        </span>
                        {registrationOpen ? (
                            <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                                Dibuka
                            </Badge>
                        ) : (
                            <Badge variant="destructive">Ditutup</Badge>
                        )}
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Total Pendaftar
                            </CardTitle>
                            <Users className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {totalPendaftar}
                            </div>
                            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3" />
                                <span>Semua berkas masuk</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Administrasi Lolos
                            </CardTitle>
                            <UserCheck className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {adminLolos}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {adminPending} menunggu, {adminDitolak} ditolak
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Screening Lolos
                            </CardTitle>
                            <CheckCircle2 className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {screeningLolos}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {screeningPending} menunggu, {screeningDitolak}{' '}
                                ditolak
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                Belum Direview
                            </CardTitle>
                            <ClipboardList className="text-muted-foreground size-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {adminPending + screeningPending}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Memerlukan review segera
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Registrants */}
                    <Card className="md:col-span-2 lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Pendaftar Terbaru</CardTitle>
                            <CardDescription>
                                Berikut adalah 5 calon peserta yang mendaftar
                                paling baru ke sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.length === 0 ? (
                                    <p className="text-muted-foreground py-8 text-center text-sm">
                                        Belum ada peserta terdaftar.
                                    </p>
                                ) : (
                                    data.slice(0, 5).map((reg, index) => (
                                        <div key={reg.id}>
                                            <div className="flex items-center justify-between gap-4 py-1">
                                                <div className="space-y-1">
                                                    <p className="text-sm leading-none font-medium">
                                                        {reg.name}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs">
                                                        {reg.delegation}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        reg.admin_status ===
                                                        'ditolak'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {reg.admin_status ===
                                                    'lolos'
                                                        ? 'Lolos'
                                                        : reg.admin_status ===
                                                            'ditolak'
                                                          ? 'Ditolak'
                                                          : 'Menunggu'}
                                                </Badge>
                                            </div>
                                            {index <
                                                Math.min(data.length, 5) -
                                                    1 && (
                                                <Separator className="mt-3" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shortcuts / Quick Actions */}
                    <Card className="flex flex-col justify-between md:col-span-2 lg:col-span-3">
                        <div>
                            <CardHeader>
                                <CardTitle>Aksi Cepat Admin</CardTitle>
                                <CardDescription>
                                    Pintasan navigasi untuk mengelola seleksi
                                    peserta dan sistem.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href="/registrasi">
                                        <ClipboardList className="mr-2 size-4" />
                                        Seleksi Administrasi & Screening
                                        <ArrowRight className="ml-auto size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href="/portal-settings">
                                        <Settings className="mr-2 size-4" />
                                        Buka / Tutup Pendaftaran
                                        <ArrowRight className="ml-auto size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </div>
                        <CardContent>
                            <Alert>
                                <AlertDescription>
                                    Tinjau seluruh berkas administrasi sebelum
                                    meloloskan calon peserta.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
