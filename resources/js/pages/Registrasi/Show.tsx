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
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import axios from 'axios';
import { fileUrl } from '@/lib/file-url';

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
    reason: string;
    shirt_size: string;
    sleeve_type: string;
    whatsapp?: string;
    birth_date?: string;
    email?: string;
    admin_status: 'pending' | 'lolos' | 'ditolak';
    admin_reviewed_at: string | null;
    screening_status: 'pending' | 'lolos' | 'ditolak';
    screening_reviewed_at: string | null;
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
    ktpKta: 'Scan KTP / KTA',
    formulir: 'Scan Formulir Pendaftaran',
    paktaIntegritas: 'Pakta Integritas Bermaterai',
    fotoFormal: 'Foto Formal Jas (Merah)',
    buktiBayar: 'Bukti Transfer Kontribusi',
};

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
                    status === 'lolos'
                        ? `Peserta diterima di tahap ${stage === 'admin' ? 'Administrasi' : 'Screening'}.`
                        : `Peserta ditolak di tahap ${stage === 'admin' ? 'Administrasi' : 'Screening'}.`,
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

    return (
        <>
            <Head title={`Detail - ${registrant.name}`} />

            <div className="max-w-6xl space-y-6 p-6">
                {/* Back & Header */}
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
                                    const fotoUrl = fotoObj?.r2_key
                                        ? fileUrl(fotoObj.r2_key)
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
                                                    new Date(
                                                        registrant.birth_date,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
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
                                        <div>
                                            <span className="mb-0.5 block font-medium text-gray-400">
                                                Kaos & Lengan
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {registrant.shirt_size} (
                                                {registrant.sleeve_type})
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
                                        const r2DownloadUrl = fileObj?.r2_key
                                            ? fileUrl(fileObj.r2_key)
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
                                                                ? fileObj.file_name
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
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                disabled={
                                                    registrant.admin_status ===
                                                        'lolos' ||
                                                    updating !== null
                                                }
                                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 bg-emerald-700 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updating === 'admin-lolos' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                                Terima
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Terima Administrasi Peserta?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin
                                                    meloloskan seleksi
                                                    administrasi untuk peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>
                                                    ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer">
                                                    Batal
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleUpdate(
                                                            'admin',
                                                            'lolos',
                                                        )
                                                    }
                                                    className="cursor-pointer border-0 bg-emerald-700 text-white hover:bg-emerald-800"
                                                >
                                                    Ya, Loloskan
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                disabled={
                                                    registrant.admin_status ===
                                                        'ditolak' ||
                                                    updating !== null
                                                }
                                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 bg-red-600 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updating ===
                                                'admin-ditolak' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5" />
                                                )}
                                                Tolak
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Tolak Administrasi Peserta?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin
                                                    menolak berkas administrasi
                                                    peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>
                                                    ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer">
                                                    Batal
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleUpdate(
                                                            'admin',
                                                            'ditolak',
                                                        )
                                                    }
                                                    className="cursor-pointer border-0 bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Ya, Tolak
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            {/* Screening Decision */}
                            <div className="space-y-2.5 border-t border-gray-50 pt-4">
                                <span className="block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                    Keputusan Screening
                                </span>
                                <div className="flex gap-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                disabled={
                                                    registrant.admin_status !==
                                                        'lolos' ||
                                                    registrant.screening_status ===
                                                        'lolos' ||
                                                    updating !== null
                                                }
                                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 bg-emerald-700 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updating ===
                                                'screening-lolos' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                                Terima
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Loloskan Screening Peserta?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>{' '}
                                                    lolos tahap
                                                    wawancara/screening?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer">
                                                    Batal
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleUpdate(
                                                            'screening',
                                                            'lolos',
                                                        )
                                                    }
                                                    className="cursor-pointer border-0 bg-emerald-700 text-white hover:bg-emerald-800"
                                                >
                                                    Ya, Loloskan
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                disabled={
                                                    registrant.admin_status !==
                                                        'lolos' ||
                                                    registrant.screening_status ===
                                                        'ditolak' ||
                                                    updating !== null
                                                }
                                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 bg-red-600 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updating ===
                                                'screening-ditolak' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5" />
                                                )}
                                                Tolak
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Tolak Screening Peserta?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin
                                                    menolak peserta{' '}
                                                    <strong>
                                                        {registrant.name}
                                                    </strong>{' '}
                                                    pada tahap screening?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer">
                                                    Batal
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleUpdate(
                                                            'screening',
                                                            'ditolak',
                                                        )
                                                    }
                                                    className="cursor-pointer border-0 bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Ya, Tolak
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                {registrant.admin_status !== 'lolos' && (
                                    <p className="mt-1 text-[9px] leading-relaxed font-medium text-red-500">
                                        * Screening hanya aktif jika status
                                        Administrasi peserta Lolos.
                                    </p>
                                )}
                            </div>
                        </div>
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
