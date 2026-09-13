import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Check,
    X,
    Loader2,
    ChevronLeft,
    FileText,
    ExternalLink,
    Download,
    Trash2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import axios from 'axios';
import { fileUrl } from '@/lib/file-url';
import { formatDate } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type RegFile = {
    id: string;
    field_key: string;
    file_name: string;
    r2_key: string;
    upload_status: 'pending' | 'uploaded' | 'failed';
};

type Registrant = {
    id: string;
    name: string;
    gender: string;
    delegation: string;
    reason: string;
    whatsapp?: string;
    birth_date?: string;
    email?: string;
    admin_status: 'pending' | 'lolos' | 'ditolak';
    admin_reviewed_at: string | null;
    screening_status: 'pending' | 'lolos' | 'ditolak';
    screening_reviewed_at: string | null;
    qr_token?: string;
    created_at: string;
    files?: RegFile[];
};

const STATUS_BADGE: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    lolos: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    ditolak: 'border-red-200 bg-red-50 text-red-600',
};

const STATUS_LABEL: Record<string, string> = {
    pending: 'Menunggu',
    lolos: 'Lolos',
    ditolak: 'Ditolak',
};

const FILE_FIELD_LABELS: Record<string, string> = {
    sertifikatMakesta: 'Sertifikat MAKESTA',
    sertifikatLakmud: 'Sertifikat LAKMUD',
    rekomendasi: 'Surat Rekomendasi PAC / PC',
    essay: 'Essay Karya Tulis',
    ktpKta: 'Kartu Tanda Penduduk (KTP)',
    formulir: 'Scan Formulir Pendaftaran',
    paktaIntegritas: 'Pakta Integritas Bermaterai',
    fotoFormal: 'Foto Formal 3×4 Background Merah',
};

const UPLOAD_STATUS_LABEL = {
    pending: 'Antre R2',
    uploaded: 'Tersimpan',
    failed: 'Upload gagal',
} satisfies Record<RegFile['upload_status'], string>;

export default function RegistrasiShow({
    registrant,
}: {
    registrant: Registrant;
}) {
    const [updating, setUpdating] = useState<string | null>(null);

    const handleUpdate = async (
        stage: 'admin' | 'screening',
        status: 'lolos' | 'ditolak',
    ) => {
        setUpdating(`${stage}-${status}`);
        try {
            const res = await axios.patch(`/registrasi/${registrant.id}`, {
                stage,
                status,
            });
            if (res.data.success) {
                toast.success(
                    res.data.message || 'Status berhasil diperbarui.',
                );
                router.reload({ only: ['registrant'] });
            }
        } catch (err: any) {
            toast.error(
                err.response?.data?.error || 'Gagal memperbarui status.',
            );
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = () => {
        router.delete(`/registrasi/${registrant.id}`, {
            onSuccess: () => {
                toast.success('Data pendaftar berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus data pendaftar');
            },
        });
    };
    const [isDownloading, setIsDownloading] = useState(false);

    const getVectorQrImage = (
        svgElement: SVGSVGElement,
        size: number,
    ): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
            clonedSvg.setAttribute('width', size.toString());
            clonedSvg.setAttribute('height', size.toString());
            if (!clonedSvg.getAttribute('viewBox')) {
                clonedSvg.setAttribute('viewBox', '0 0 256 256');
            }

            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgBlob = new Blob([svgData], {
                type: 'image/svg+xml;charset=utf-8',
            });
            const blobUrl = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(blobUrl);
                resolve(img);
            };
            img.onerror = (e) => {
                URL.revokeObjectURL(blobUrl);
                reject(e);
            };
            img.src = blobUrl;
        });
    };

    const downloadQRCode = async () => {
        const svg = document.querySelector(
            '#qr-code-svg svg',
        ) as SVGSVGElement | null;
        if (!svg) {
            toast.error('QR Code tidak ditemukan.');
            return;
        }

        setIsDownloading(true);
        try {
            // Ultra HD square canvas: 1200 x 1200 px
            const canvasSize = 1200;
            const margin = 100;
            const qrSize = canvasSize - margin * 2; // 1000 x 1000 px

            const canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Pure clean white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // Pure sharp vector QR Code, centered with margin, NO text underneath
            const qrImg = await getVectorQrImage(svg, qrSize);
            ctx.drawImage(qrImg, margin, margin, qrSize, qrSize);

            // Export PNG
            const pngFile = canvas.toDataURL('image/png', 1.0);
            const downloadLink = document.createElement('a');
            const safeName = registrant.name
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const safeDelegation = registrant.delegation
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            downloadLink.download = `${safeName}_${safeDelegation}_qrcode.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast.success('QR Code berhasil diunduh');
        } catch {
            toast.error('Gagal mengunduh QR Code.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Head title={`Detail - ${registrant.name}`} />

            <div className="max-w-6xl space-y-6 p-4 sm:p-6">
                {/* Back & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/registrasi"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all hover:scale-105 hover:bg-gray-50 hover:text-gray-900 active:scale-95"
                            aria-label="Kembali"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-base leading-tight font-bold text-gray-900">
                                Detail Profil & Berkas
                            </h1>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Detail pendaftaran peserta LATIN & LATPEL
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 w-full justify-center rounded-xl border border-red-100/80 bg-red-50 px-4 font-medium text-red-600 hover:bg-red-100 hover:text-red-700 sm:w-auto"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus Data
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Hapus Pendaftar?</DialogTitle>
                                    <DialogDescription>
                                        Apakah Anda yakin ingin menghapus
                                        pendaftar ini? Tindakan ini tidak dapat
                                        dibatalkan dan semua berkas yang
                                        terunggah di penyimpanan (Cloudflare R2)
                                        akan dihapus permanen.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Batal</Button>
                                    </DialogClose>
                                    <Button
                                        onClick={handleDelete}
                                        variant="destructive"
                                    >
                                        Ya, Hapus Data
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left Side: Data Diri & Status */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Profil */}
                        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="border-b border-gray-50 pb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                Data Diri & Profil
                            </h3>

                            <div className="flex flex-col gap-6 sm:flex-row">
                                {/* Foto Formal (fotoFormal) Preview */}
                                {(() => {
                                    const fotoObj = registrant.files?.find(
                                        (f) => f.field_key === 'fotoFormal',
                                    );
                                    const fotoUrl = fotoObj?.id
                                        ? fileUrl(fotoObj.id)
                                        : null;

                                    return (
                                        <div className="flex shrink-0 flex-col items-center">
                                            {fotoUrl ? (
                                                <div className="group relative h-36 w-28 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                                                    <img
                                                        src={fotoUrl}
                                                        alt={`Foto Formal ${registrant.name}`}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-36 w-28 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-2 text-center text-gray-300">
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        Tidak ada Foto Formal
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Data Diri Fields */}
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                Nama Lengkap
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {registrant.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                Jenis Kelamin
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {registrant.gender}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                Tanggal Lahir
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {registrant.birth_date ? (
                                                    formatDate(
                                                        registrant.birth_date,
                                                        'long',
                                                    )
                                                ) : (
                                                    <span className="text-gray-300">
                                                        -
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                No. WhatsApp
                                            </span>
                                            {registrant.whatsapp ? (
                                                <a
                                                    href={`https://wa.me/${registrant.whatsapp.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex w-fit cursor-pointer items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
                                                >
                                                    {registrant.whatsapp}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="font-semibold text-gray-800">
                                                    -
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                Alamat Email
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {registrant.email || (
                                                    <span className="text-gray-300">
                                                        -
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                Asal Delegasi
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {registrant.delegation}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 text-xs">
                                        <span className="mb-0.5 block font-medium text-gray-400">
                                            Alasan Pelatihan
                                        </span>
                                        <p className="rounded-lg bg-gray-50 p-3 leading-relaxed font-medium text-gray-700">
                                            {registrant.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dokumen */}
                        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="border-b border-gray-50 pb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                Unggah Berkas & Dokumen R2
                            </h3>
                            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                                {Object.entries(FILE_FIELD_LABELS).map(
                                    ([fieldKey, label]) => {
                                        const fileObj = registrant.files?.find(
                                            (f) => f.field_key === fieldKey,
                                        );
                                        const r2DownloadUrl = fileObj?.id
                                            ? fileUrl(fileObj.id)
                                            : '#';

                                        return (
                                            <div
                                                key={fieldKey}
                                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/30 p-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                                                    <div className="min-w-0">
                                                        <span className="block max-w-[140px] truncate font-semibold text-gray-700">
                                                            {label}
                                                        </span>
                                                        <span className="block max-w-[140px] truncate text-[9px] text-gray-400">
                                                            {fileObj
                                                                ? `${fileObj.file_name} · ${UPLOAD_STATUS_LABEL[fileObj.upload_status]}`
                                                                : 'Belum diunggah'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {fileObj ? (
                                                    <a
                                                        href={r2DownloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 transition-colors hover:text-emerald-900 hover:underline"
                                                    >
                                                        Buka{' '}
                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                ) : (
                                                    <span className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[9px] font-bold text-red-500 select-none">
                                                        Kosong
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Status & Decision Panel */}
                    <div className="space-y-6">
                        {/* Status Display */}
                        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="border-b border-gray-50 pb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                Status Seleksi
                            </h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-1">
                                    <span className="font-medium text-gray-500">
                                        Administrasi
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${STATUS_BADGE[registrant.admin_status]}`}
                                    >
                                        {STATUS_LABEL[registrant.admin_status]}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-50 py-1 pt-2">
                                    <span className="font-medium text-gray-500">
                                        Screening
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${STATUS_BADGE[registrant.screening_status]}`}
                                    >
                                        {
                                            STATUS_LABEL[
                                                registrant.screening_status
                                            ]
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Decision Panel */}
                        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="border-b border-gray-50 pb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                Panel Keputusan
                            </h3>

                            {/* Administrasi Decision */}
                            <div className="space-y-2.5">
                                <span className="block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                    Keputusan Administrasi
                                </span>
                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                disabled={
                                                    registrant.admin_status ===
                                                        'lolos' ||
                                                    updating !== null
                                                }
                                                className="flex-1 bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                                            >
                                                {updating === 'admin-lolos' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                                Terima
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Terima Administrasi Peserta?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Apakah Anda yakin ingin
                                                    meloloskan seleksi
                                                    administrasi untuk peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>
                                                    ?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">
                                                        Batal
                                                    </Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        onClick={() =>
                                                            handleUpdate(
                                                                'admin',
                                                                'lolos',
                                                            )
                                                        }
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                    >
                                                        Ya, Loloskan
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                disabled={
                                                    registrant.admin_status ===
                                                        'ditolak' ||
                                                    updating !== null
                                                }
                                                className="flex-1 text-xs font-bold"
                                            >
                                                {updating ===
                                                'admin-ditolak' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5" />
                                                )}
                                                Tolak
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Tolak Administrasi Peserta?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Apakah Anda yakin ingin
                                                    menolak berkas administrasi
                                                    peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>
                                                    ?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">
                                                        Batal
                                                    </Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleUpdate(
                                                                'admin',
                                                                'ditolak',
                                                            )
                                                        }
                                                    >
                                                        Ya, Tolak
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Screening Decision */}
                            <div className="space-y-2.5 border-t border-gray-50 pt-4">
                                <span className="block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                    Keputusan Screening
                                </span>
                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                disabled={
                                                    registrant.admin_status !==
                                                        'lolos' ||
                                                    registrant.screening_status ===
                                                        'lolos' ||
                                                    updating !== null
                                                }
                                                className="flex-1 bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                                            >
                                                {updating ===
                                                'screening-lolos' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                                Terima
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Loloskan Screening Peserta?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Apakah Anda yakin peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>{' '}
                                                    lolos tahap
                                                    wawancara/screening?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">
                                                        Batal
                                                    </Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        onClick={() =>
                                                            handleUpdate(
                                                                'screening',
                                                                'lolos',
                                                            )
                                                        }
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                    >
                                                        Ya, Loloskan
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                disabled={
                                                    registrant.admin_status !==
                                                        'lolos' ||
                                                    registrant.screening_status ===
                                                        'ditolak' ||
                                                    updating !== null
                                                }
                                                className="flex-1 text-xs font-bold"
                                            >
                                                {updating ===
                                                'screening-ditolak' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5" />
                                                )}
                                                Tolak
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Tolak Screening Peserta?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Apakah Anda yakin ingin
                                                    menolak peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>{' '}
                                                    pada tahap screening?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">
                                                        Batal
                                                    </Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleUpdate(
                                                                'screening',
                                                                'ditolak',
                                                            )
                                                        }
                                                    >
                                                        Ya, Tolak
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                {registrant.admin_status !== 'lolos' && (
                                    <p className="mt-1 text-[9px] leading-relaxed font-medium text-red-500">
                                        * Screening hanya aktif jika status
                                        Administrasi peserta Lolos.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Panel QR Code */}
                        {registrant.qr_token && (
                            <Card className="gap-0 overflow-hidden py-0">
                                <CardHeader className="border-b py-4">
                                    <CardTitle className="text-xs tracking-wider uppercase">
                                        QR Code Absensi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center space-y-4 py-5">
                                    <div className="group relative rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                                        <div id="qr-code-svg">
                                            <QRCode
                                                value={registrant.qr_token}
                                                size={180}
                                                level="H"
                                            />
                                        </div>
                                    </div>

                                    {/* Download Action Button */}
                                    <div className="w-full pt-1">
                                        <Button
                                            onClick={downloadQRCode}
                                            disabled={isDownloading}
                                            variant="default"
                                            className="h-10 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="mr-2 h-4 w-4" />
                                            )}
                                            Unduh QR Code (HD)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

RegistrasiShow.layout = ({ registrant }: { registrant: Registrant }) => ({
    breadcrumbs: [
        { title: 'Seleksi Peserta', href: '/registrasi' },
        { title: registrant.name, href: `/registrasi/${registrant.id}` },
    ],
});
