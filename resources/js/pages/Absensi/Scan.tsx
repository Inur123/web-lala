import { useCallback, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Building2,
    Camera,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Info,
    ScanLine,
    UserCheck,
} from 'lucide-react';
import { QrScanner } from '@/components/qr-scanner';
import axios, { AxiosError } from 'axios';
import { formatTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const SCAN_PREVIEW_DURATION_MS = 3000;

type RecentAttendance = {
    id: string;
    name: string;
    delegation: string;
    gender: string;
    photo_url?: string | null;
    scanned_at: string;
};

type ScannedParticipantPreview = {
    key: number;
    status: 'success' | 'duplicate';
    participant: string;
    delegation: string;
    gender: string;
    photoUrl: string | null;
    scannedAt: string | null;
    message: string;
};

type ScanResponsePayload = {
    success?: boolean;
    message?: string;
    participant?: string;
    delegation?: string;
    gender?: string;
    photo_url?: string | null;
    scanned_at?: string | null;
};

function participantInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return '?';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function ScannedParticipantOverlay({
    preview,
    onDismiss,
}: {
    preview: ScannedParticipantPreview;
    onDismiss: () => void;
}) {
    const isDuplicate = preview.status === 'duplicate';

    return (
        <div
            key={preview.key}
            role="status"
            aria-live="polite"
            className={`animate-in fade-in zoom-in-95 absolute inset-0 z-30 flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-white duration-200 md:rounded-3xl ${
                isDuplicate ? 'border-amber-200' : 'border-emerald-200'
            }`}
        >
            <style>{`
                @keyframes scan-preview-countdown {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>

            {/* Header status & shortcut kembali ke kamera */}
            <div className="flex items-center justify-between gap-2 px-4 pt-3.5 sm:px-5 sm:pt-4">
                <Badge
                    variant="outline"
                    className={
                        isDuplicate
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }
                >
                    {isDuplicate ? (
                        <Info className="h-3.5 w-3.5" />
                    ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {isDuplicate ? 'Sudah Absen' : 'Absensi Berhasil'}
                </Badge>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDismiss}
                    className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-gray-600"
                >
                    <Camera className="h-3.5 w-3.5" />
                    Lanjut Scan
                </Button>
            </div>

            {/* Detail foto, nama, dan delegasi peserta */}
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-3 text-center">
                <div className="relative">
                    <Avatar
                        className={`h-32 w-24 rounded-2xl border-2 shadow-md ring-4 sm:h-40 sm:w-32 ${
                            isDuplicate
                                ? 'border-amber-200 ring-amber-50'
                                : 'border-emerald-200 ring-emerald-50'
                        }`}
                    >
                        {preview.photoUrl ? (
                            <AvatarImage
                                src={preview.photoUrl}
                                alt={`Foto ${preview.participant}`}
                                className="rounded-2xl object-cover object-top"
                            />
                        ) : null}
                        <AvatarFallback
                            className={`rounded-2xl text-2xl font-bold sm:text-3xl ${
                                isDuplicate
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                            {participantInitials(preview.participant)}
                        </AvatarFallback>
                    </Avatar>

                    <span
                        className={`absolute -right-2 -bottom-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow-sm ${
                            isDuplicate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                    >
                        {isDuplicate ? (
                            <Info className="h-4 w-4" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                    </span>
                </div>

                <h2 className="mt-3.5 line-clamp-2 max-w-md text-lg font-bold tracking-tight text-gray-900 sm:mt-4 sm:text-2xl">
                    {preview.participant}
                </h2>

                <div
                    className={`mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-medium sm:text-sm ${
                        isDuplicate
                            ? 'border-amber-200/80 bg-amber-50/70 text-amber-800'
                            : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-800'
                    }`}
                >
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{preview.delegation}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    {preview.scannedAt ? (
                        <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {isDuplicate
                                ? `Tercatat pukul ${preview.scannedAt}`
                                : preview.scannedAt}
                        </span>
                    ) : (
                        <span>{preview.message}</span>
                    )}
                </div>
            </div>

            {/* Indikator mundur sebelum kamera aktif lagi */}
            <div className="bg-gray-50/70">
                <p className="px-4 py-2 text-center text-[11px] font-medium text-gray-500">
                    Kamera aktif kembali dalam beberapa detik...
                </p>
                <div className="h-1.5 w-full overflow-hidden bg-gray-100">
                    <div
                        className={`h-full w-full origin-left ${
                            isDuplicate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                            animation: `scan-preview-countdown ${SCAN_PREVIEW_DURATION_MS}ms linear forwards`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

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
    const [scannedPreview, setScannedPreview] =
        useState<ScannedParticipantPreview | null>(null);
    const [recentList, setRecentList] = useState<RecentAttendance[]>(
        initialRecentAttendances,
    );
    const [attendedCount, setAttendedCount] = useState<number>(
        session.total_attended || initialRecentAttendances.length,
    );

    useEffect(() => {
        if (scannedPreview === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            setScannedPreview(null);
        }, SCAN_PREVIEW_DURATION_MS);

        return () => {
            window.clearTimeout(timer);
        };
    }, [scannedPreview]);

    const handleScan = useCallback(
        async (decodedText: string) => {
            if (isScanning || scannedPreview !== null) return;
            setIsScanning(true);

            try {
                const res = await axios.post<ScanResponsePayload>(
                    `/absensi/${session.id}/scan`,
                    {
                        qr_token: decodedText,
                    },
                );

                if (res.data.success && res.data.participant) {
                    const scannedAt = res.data.scanned_at || formatTime();
                    const delegation = res.data.delegation || '-';
                    const gender = res.data.gender || 'L';
                    const photoUrl = res.data.photo_url ?? null;

                    const newEntry: RecentAttendance = {
                        id: String(Date.now()),
                        name: res.data.participant,
                        delegation,
                        gender,
                        photo_url: photoUrl,
                        scanned_at: scannedAt,
                    };

                    setRecentList((prev) => [newEntry, ...prev.slice(0, 19)]);
                    setAttendedCount((prev) => prev + 1);
                    setScannedPreview({
                        key: Date.now(),
                        status: 'success',
                        participant: res.data.participant,
                        delegation,
                        gender,
                        photoUrl,
                        scannedAt,
                        message:
                            res.data.message || 'Absensi berhasil dicatat.',
                    });

                    toast.success(`Hadir: ${res.data.participant}`, {
                        description: `${delegation} • ${scannedAt}`,
                    });
                }
            } catch (error: unknown) {
                const err = error as AxiosError<ScanResponsePayload>;
                const payload = err.response?.data;
                const errMsg =
                    payload?.message ||
                    'Terjadi kesalahan saat memproses QR Code.';

                if (err.response?.status === 409 && payload?.participant) {
                    const delegation = payload.delegation || '-';
                    setScannedPreview({
                        key: Date.now(),
                        status: 'duplicate',
                        participant: payload.participant,
                        delegation,
                        gender: payload.gender || 'L',
                        photoUrl: payload.photo_url ?? null,
                        scannedAt: payload.scanned_at ?? null,
                        message: errMsg,
                    });
                    toast.warning(errMsg, {
                        description: `${payload.participant} • ${delegation}`,
                    });
                } else {
                    toast.error(errMsg);
                }
            } finally {
                // Kamera langsung siap untuk peserta berikutnya tanpa jeda berlebihan
                setIsScanning(false);
            }
        },
        [isScanning, scannedPreview, session.id],
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
                        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm md:rounded-3xl">
                            <QrScanner
                                onScan={handleScan}
                                isProcessing={isScanning}
                                paused={scannedPreview !== null}
                            />
                            {scannedPreview ? (
                                <ScannedParticipantOverlay
                                    preview={scannedPreview}
                                    onDismiss={() => setScannedPreview(null)}
                                />
                            ) : null}
                        </div>
                        <p className="text-center text-xs text-gray-400">
                            {scannedPreview
                                ? 'Menampilkan identitas peserta yang terdeteksi. Kamera aktif kembali dalam 3 detik.'
                                : 'Arahkan QR Code ke layar kamera. Data kehadiran otomatis diverifikasi instan.'}
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
                                                <Avatar className="h-9 w-9 shrink-0 border border-emerald-200/80">
                                                    {item.photo_url ? (
                                                        <AvatarImage
                                                            src={item.photo_url}
                                                            alt={`Foto ${item.name}`}
                                                            className="object-cover object-top"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="bg-emerald-100 text-xs font-bold text-emerald-700">
                                                        {participantInitials(
                                                            item.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
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
