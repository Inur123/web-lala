import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    Clock,
    QrCode,
    Search,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';

type Attendance = {
    id: string | number;
    attendance_session_id: string | number;
    registration_id: string;
    status: 'belum absen' | 'sudah absen';
    scanned_at: string | null;
    scanned_at_formatted?: string | null;
    registration: {
        name: string;
        delegation: string;
        gender?: string;
    };
};

type Session = {
    id: string | number;
    name: string;
    description: string | null;
    created_at: string;
    attendances: Attendance[];
};

type FilterStatus = 'all' | 'sudah absen' | 'belum absen';

export default function AbsensiShow({ session }: { session: Session }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    const attendances = session.attendances || [];
    const totalCount = attendances.length;
    const hadirCount = attendances.filter(
        (a) => a.status === 'sudah absen',
    ).length;
    const belumCount = attendances.filter(
        (a) => a.status === 'belum absen',
    ).length;

    const filteredAttendances = useMemo(() => {
        return attendances.filter((a) => {
            const matchesSearch =
                (a.registration?.name || '')
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (a.registration?.delegation || '')
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesFilter =
                filterStatus === 'all' || a.status === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [attendances, search, filterStatus]);

    return (
        <>
            <Head title={`Absensi - ${session.name}`} />

            <div className="flex w-full flex-col gap-6 p-4 md:p-6">
                {/* Header Sesi */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link
                                href="/absensi"
                                aria-label="Kembali ke daftar absensi"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                    {session.name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                    <Users className="h-3 w-3" />
                                    {totalCount} Peserta
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                {session.description ||
                                    'Kelola kehadiran untuk sesi ini'}
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto">
                        <Button
                            className="w-full justify-center sm:w-auto"
                            asChild
                        >
                            <Link href={`/absensi/${session.id}/scan`}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Pindai QR Code
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filter & Table Container */}
                <Card className="gap-0 overflow-hidden py-0">
                    {/* Toolbar: Status Filter Pills & Search */}
                    <CardHeader className="bg-muted/30 flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    filterStatus === 'sudah absen'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    setFilterStatus((prev) =>
                                        prev === 'sudah absen'
                                            ? 'all'
                                            : 'sudah absen',
                                    )
                                }
                                className={`shrink-0 text-xs ${
                                    filterStatus === 'sudah absen'
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                                title={
                                    filterStatus === 'sudah absen'
                                        ? 'Klik untuk menampilkan semua'
                                        : 'Filter peserta yang sudah hadir'
                                }
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Hadir</span>
                                <span
                                    className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                                        filterStatus === 'sudah absen'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {hadirCount}
                                </span>
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    filterStatus === 'belum absen'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    setFilterStatus((prev) =>
                                        prev === 'belum absen'
                                            ? 'all'
                                            : 'belum absen',
                                    )
                                }
                                className={`shrink-0 text-xs ${
                                    filterStatus === 'belum absen'
                                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                                        : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                                title={
                                    filterStatus === 'belum absen'
                                        ? 'Klik untuk menampilkan semua'
                                        : 'Filter peserta yang belum hadir'
                                }
                            >
                                <Clock className="h-3.5 w-3.5" />
                                <span>Belum</span>
                                <span
                                    className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                                        filterStatus === 'belum absen'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                    {belumCount}
                                </span>
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari nama atau delegasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 rounded-xl border-gray-200 bg-white pr-9 pl-9"
                            />
                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearch('')}
                                    className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label="Hapus pencarian"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    {/* Table */}
                    <CardContent className="p-0">
                        <Table className="text-gray-600">
                            <TableHeader className="bg-muted/30 text-muted-foreground text-xs uppercase">
                                <TableRow>
                                    <TableHead className="w-14 px-4 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="px-6">
                                        Nama Peserta
                                    </TableHead>
                                    <TableHead className="px-6">
                                        Delegasi
                                    </TableHead>
                                    <TableHead className="w-32 px-6 text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-6 text-right">
                                        Waktu Absen
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-50">
                                {filteredAttendances.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="h-8 w-8 text-gray-300" />
                                                <p className="font-medium text-gray-700">
                                                    Tidak ada peserta yang
                                                    ditemukan
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {search
                                                        ? `Tidak ada data yang cocok dengan kata kunci "${search}"`
                                                        : 'Belum ada data peserta pada sesi ini.'}
                                                </p>
                                                {search && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSearch('')
                                                        }
                                                        className="mt-2 text-xs"
                                                    >
                                                        Reset Pencarian
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAttendances.map((att, index) => {
                                        const initial = (
                                            att.registration?.name || '?'
                                        )
                                            .charAt(0)
                                            .toUpperCase();
                                        return (
                                            <TableRow
                                                key={att.id}
                                                className="group transition-colors hover:bg-gray-50/60"
                                            >
                                                {/* No Column */}
                                                <TableCell className="px-4 py-4 text-center text-xs font-semibold text-gray-400 tabular-nums sm:text-sm">
                                                    {index + 1}
                                                </TableCell>

                                                {/* Nama Peserta */}
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                                                            {initial}
                                                        </div>
                                                        <span className="font-medium text-gray-900 transition-colors group-hover:text-emerald-700">
                                                            {att.registration
                                                                ?.name || '-'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Delegasi */}
                                                <TableCell className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-1 text-xs font-medium text-gray-700">
                                                        {att.registration
                                                            ?.delegation || '-'}
                                                    </span>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="px-6 py-4 text-center">
                                                    {att.status ===
                                                    'sudah absen' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Hadir
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Belum
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Waktu Absen */}
                                                <TableCell className="px-6 py-4 text-right text-xs font-medium whitespace-nowrap text-gray-700 tabular-nums sm:text-sm">
                                                    {att.scanned_at ? (
                                                        att.scanned_at_formatted ||
                                                        formatDateTime(
                                                            att.scanned_at,
                                                        )
                                                    ) : (
                                                        <span className="font-normal text-gray-300">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Footer Info */}
                    {filteredAttendances.length > 0 && (
                        <CardFooter className="bg-muted/20 flex items-center justify-between border-t px-6 py-3 text-xs text-gray-500">
                            <span>
                                Menampilkan{' '}
                                <strong>{filteredAttendances.length}</strong>{' '}
                                dari total <strong>{totalCount}</strong> peserta
                            </span>
                            {filterStatus !== 'all' && (
                                <span className="font-medium text-emerald-700">
                                    Difilter berdasarkan:{' '}
                                    {filterStatus === 'sudah absen'
                                        ? 'Sudah Hadir'
                                        : 'Belum Hadir'}
                                </span>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </div>
        </>
    );
}

AbsensiShow.layout = ({ session }: { session: Session }) => ({
    breadcrumbs: [
        { title: 'Absensi Peserta', href: '/absensi' },
        { title: 'Detail Sesi', href: `/absensi/${session.id}` },
    ],
});
