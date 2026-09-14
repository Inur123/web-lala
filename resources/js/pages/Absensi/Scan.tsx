import { useCallback, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { ChevronLeft, Clock, ScanLine, UserCheck } from 'lucide-react';
import { QrScanner } from '@/components/qr-scanner';
import axios, { AxiosError } from 'axios';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type RecentAttendance = {
    id: string;
    name: string;
    delegation: string;
    gender: string;
    scanned_at: string;
};

type ScanPageProps = {
    session: {
        id: string;
        name: string;
        description: string | null;
        total_attended?: number;
        total_registered?: number;
    };
    initialRecentAttendances?: RecentAttendance[];
};

export default function AbsensiScan({
    session,
    initialRecentAttendances = [],
}: ScanPageProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [recentList, setRecentList] = useState<RecentAttendance[]>(
        initialRecentAttendances,
    );
    const [attendedCount, setAttendedCount] = useState<number>(
        session.total_attended || initialRecentAttendances.length,
    );

    const handleScan = useCallback(
        async (decodedText: string) => {
            if (isScanning) return;
            setIsScanning(true);

            try {
                const res = await axios.post(`/absensi/${session.id}/scan`, {
                    qr_token: decodedText,
                });

                if (res.data.success) {
                    const newEntry: RecentAttendance = {
                        id: String(Date.now()),
                        name: res.data.participant,
                        delegation: res.data.delegation || '-',
                        gender: res.data.gender || 'L',
                        scanned_at: res.data.scanned_at || formatTime(),
                    };

                    setRecentList((prev) => [newEntry, ...prev.slice(0, 19)]);
                    setAttendedCount((prev) => prev + 1);

                    toast.success(`Hadir: ${res.data.participant}`, {
                        description: `${res.data.delegation || ''} • ${newEntry.scanned_at}`,
                    });
                }
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>;
                const errMsg =
                    err.response?.data?.message ||
                    'Terjadi kesalahan saat memproses QR Code.';
                toast.error(errMsg);
            } finally {
                // Kamera langsung siap untuk peserta berikutnya tanpa jeda berlebihan
                setIsScanning(false);
            }
        },
        [isScanning, session.id],
    );

    return (
        <>
            <Head title={`Pindai QR - ${session.name}`} />

            <div className="flex w-full flex-col gap-6 p-4 md:p-6">
                {/* Header dengan navigasi dan informasi sesi */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link
                                href={`/absensi/${session.id}`}
                                aria-label="Kembali ke detail sesi absensi"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                                    Scanner Absensi
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    Sesi Aktif
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs md:text-sm">
                                {session.name}{' '}
                                {session.description &&
                                    `• ${session.description}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scanner dan daftar absensi terkini */}
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
                    {/* Left Column: Full-Frame Fast Scanner */}
                    <div className="flex flex-col gap-3 lg:col-span-7">
                        <div className="relative w-full overflow-hidden rounded-3xl shadow-sm">
                            <QrScanner
                                onScan={handleScan}
                                isProcessing={isScanning}
                            />
                        </div>
                        <p className="text-center text-xs text-gray-400">
                            Arahkan QR Code ke layar kamera. Data kehadiran
                            otomatis diverifikasi instan.
                        </p>
                    </div>

                    {/* Kolom riwayat absensi terkini */}
                    <div className="flex flex-col gap-4 lg:col-span-5">
                        <Card className="min-h-[460px] gap-0 overflow-hidden py-0">
                            <CardHeader className="flex-row items-center justify-between border-b py-4">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                    <CardTitle className="text-sm md:text-base">
                                        Riwayat Terkini
                                    </CardTitle>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                    {attendedCount} Hadir
                                </Badge>
                            </CardHeader>

                            <CardContent className="max-h-[420px] flex-1 divide-y overflow-y-auto px-5 py-2">
                                {recentList.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-gray-400">
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                                            <ScanLine className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Belum ada presensi
                                        </p>
                                        <p className="mt-1 max-w-xs text-xs text-gray-400">
                                            Pindai QR Code peserta di depan
                                            kamera untuk mencatat kehadiran.
                                        </p>
                                    </div>
                                ) : (
                                    recentList.map((item, idx) => (
                                        <div
                                            key={`${item.id}-${idx}`}
                                            className="group flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50/80"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                    {item.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {item.name}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        {item.delegation}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1.5 text-right">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="font-mono text-xs font-medium text-gray-500">
                                                    {item.scanned_at}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>

                            <CardFooter className="mt-auto border-t p-4">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href={`/absensi/${session.id}`}>
                                        Lihat Seluruh Daftar Hadir Sesi Ini →
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AbsensiScan.layout = ({ session }: ScanPageProps) => ({
    breadcrumbs: [
        { title: 'Absensi Peserta', href: '/absensi' },
        { title: 'Scanner Absensi', href: `/absensi/${session.id}/scan` },
    ],
});
