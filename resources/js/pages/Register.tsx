import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChevronLeft,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import axios from 'axios';

const FILE_FIELDS = [
    {
        key: 'sertifikatMakesta',
        label: 'Sertifikat MAKESTA',
        desc: 'Format PDF, Maks 10MB',
    },
    {
        key: 'sertifikatLakmud',
        label: 'Sertifikat LAKMUD',
        desc: 'Format PDF, Maks 10MB',
    },
    {
        key: 'rekomendasi',
        label: 'Surat Rekomendasi PAC / PC',
        desc: 'Format PDF, Maks 10MB',
    },
    { key: 'essay', label: 'Essay Karya Tulis', desc: 'Format PDF, Maks 10MB' },
    {
        key: 'ktpKta',
        label: 'Scan KTP / KTA',
        desc: 'Format Gambar/PDF, Maks 10MB',
    },
    {
        key: 'formulir',
        label: 'Scan Formulir Pendaftaran',
        desc: 'Format PDF, Maks 10MB',
    },
    {
        key: 'paktaIntegritas',
        label: 'Pakta Integritas Bermaterai',
        desc: 'Format PDF/Gambar, Maks 10MB',
    },
    {
        key: 'fotoFormal',
        label: 'Foto Formal Jas (Merah)',
        desc: 'Wajib Gambar (JPG/PNG), Maks 10MB',
    },
    {
        key: 'buktiBayar',
        label: 'Bukti Transfer Kontribusi',
        desc: 'Format Gambar/PDF, Maks 10MB',
    },
] as const;

export default function Register({ isOpen }: { isOpen: boolean }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Using standard state because Inertia useForm with many files can be tricky with progress
    // But FormData via axios is more robust for our custom JSON response handling.
    const [data, setData] = useState<Record<string, any>>({
        name: '',
        gender: '',
        delegation: '',
        reason: '',
        shirtSize: '',
        sleeveType: '',
        whatsapp: '',
        birthDate: '',
        email: '',
    });

    const [files, setFiles] = useState<Record<string, File | null>>({});

    if (!isOpen) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <Head title="Pendaftaran Ditutup" />
                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-black text-gray-900">
                        Pendaftaran Ditutup
                    </h1>
                    <p className="mb-8 font-medium text-gray-500">
                        Mohon maaf, form registrasi LATIN & LATPEL 2026 sedang
                        ditutup oleh panitia.
                    </p>
                    <Link href="/">
                        <Button className="w-full rounded-xl bg-gray-900 px-8 py-6 font-bold hover:bg-gray-800">
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-green-50/50 p-6">
                <Head title="Pendaftaran Berhasil" />
                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h1 className="mb-2 text-2xl font-black text-gray-900">
                        Pendaftaran Berhasil!
                    </h1>
                    <p className="mb-8 font-medium text-gray-500">
                        Terima kasih, data dan berkas Anda telah tersimpan di
                        sistem kami. Silakan tunggu pengumuman lolos tahap
                        administrasi melalui website.
                    </p>
                    <Link href="/pendaftar">
                        <Button className="w-full rounded-xl bg-[#1a4d2e] px-8 py-6 font-bold hover:bg-[#123620]">
                            Cek Status Pendaftaran Anda
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleChange = (key: string, value: string) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (key: string, file: File | null) => {
        setFiles((prev) => ({ ...prev, [key]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        const requiredText = [
            'name',
            'gender',
            'delegation',
            'reason',
            'shirtSize',
            'sleeveType',
            'whatsapp',
            'birthDate',
            'email',
        ];
        for (const f of requiredText) {
            if (!data[f]) {
                toast.error(`Mohon lengkapi field ${f}`);
                return;
            }
        }
        for (const f of FILE_FIELDS) {
            if (!files[f.key]) {
                toast.error(`Berkas ${f.label} wajib diunggah`);
                return;
            }
        }

        setIsSubmitting(true);

        const formData = new FormData();
        Object.keys(data).forEach((k) => formData.append(k, data[k]));
        Object.keys(files).forEach((k) => {
            if (files[k]) formData.append(k, files[k] as File);
        });

        try {
            const res = await axios.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setSuccess(true);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(
                err.response?.data?.error ||
                    'Gagal mengirimkan pendaftaran. Silakan coba lagi.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Form Registrasi - LATIN & LATPEL 2026" />

            <div className="container mx-auto max-w-4xl px-6">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="mb-6 inline-flex items-center text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Kembali ke
                        Beranda
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <AppLogoIcon className="h-8 w-8 text-[#1a4d2e]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 md:text-3xl">
                                Formulir Pendaftaran
                            </h1>
                            <p className="text-sm font-medium text-gray-500">
                                LATIN & LATPEL PC IPNU IPPNU Kabupaten Magetan
                                2026
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl sm:p-12">
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* 1. Biodata */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="border-b border-gray-100 pb-2 text-lg font-bold text-gray-900">
                                    1. Biodata Diri
                                </h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="font-bold text-gray-600"
                                    >
                                        Nama Lengkap (Sesuai KTP)
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Masukkan nama lengkap"
                                        className="h-11 rounded-xl border-gray-200"
                                        value={data.name}
                                        onChange={(e) =>
                                            handleChange('name', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-600">
                                        Jenis Kelamin
                                    </Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(val) =>
                                            handleChange('gender', val)
                                        }
                                        required
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-gray-200">
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laki-laki">
                                                Laki-laki (IPNU)
                                            </SelectItem>
                                            <SelectItem value="Perempuan">
                                                Perempuan (IPPNU)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="birthDate"
                                        className="font-bold text-gray-600"
                                    >
                                        Tanggal Lahir
                                    </Label>
                                    <Input
                                        type="date"
                                        id="birthDate"
                                        className="h-11 rounded-xl border-gray-200"
                                        value={data.birthDate}
                                        onChange={(e) =>
                                            handleChange(
                                                'birthDate',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="delegation"
                                        className="font-bold text-gray-600"
                                    >
                                        Delegasi / Utusan (PAC / PC)
                                    </Label>
                                    <Input
                                        id="delegation"
                                        placeholder="Contoh: PAC IPNU Magetan"
                                        className="h-11 rounded-xl border-gray-200"
                                        value={data.delegation}
                                        onChange={(e) =>
                                            handleChange(
                                                'delegation',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="whatsapp"
                                        className="font-bold text-gray-600"
                                    >
                                        No. WhatsApp Aktif
                                    </Label>
                                    <Input
                                        id="whatsapp"
                                        type="tel"
                                        placeholder="08xxxx"
                                        className="h-11 rounded-xl border-gray-200"
                                        value={data.whatsapp}
                                        onChange={(e) =>
                                            handleChange(
                                                'whatsapp',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="font-bold text-gray-600"
                                    >
                                        Alamat Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        className="h-11 rounded-xl border-gray-200"
                                        value={data.email}
                                        onChange={(e) =>
                                            handleChange(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label
                                        htmlFor="reason"
                                        className="font-bold text-gray-600"
                                    >
                                        Alasan Mengikuti Pelatihan
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Tuliskan alasan / motivasi Anda mengikuti pelatihan ini secara singkat dan jelas."
                                        className="min-h-[100px] rounded-xl border-gray-200"
                                        value={data.reason}
                                        onChange={(e) =>
                                            handleChange(
                                                'reason',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Atribut */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="border-b border-gray-100 pb-2 text-lg font-bold text-gray-900">
                                    2. Ukuran Atribut Kaos
                                </h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-600">
                                        Ukuran Kaos
                                    </Label>
                                    <Select
                                        value={data.shirtSize}
                                        onValueChange={(val) =>
                                            handleChange('shirtSize', val)
                                        }
                                        required
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-gray-200">
                                            <SelectValue placeholder="Pilih ukuran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="S">S</SelectItem>
                                            <SelectItem value="M">M</SelectItem>
                                            <SelectItem value="L">L</SelectItem>
                                            <SelectItem value="XL">
                                                XL
                                            </SelectItem>
                                            <SelectItem value="XXL">
                                                XXL
                                            </SelectItem>
                                            <SelectItem value="XXXL">
                                                XXXL
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-gray-600">
                                        Tipe Lengan Kaos
                                    </Label>
                                    <Select
                                        value={data.sleeveType}
                                        onValueChange={(val) =>
                                            handleChange('sleeveType', val)
                                        }
                                        required
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-gray-200">
                                            <SelectValue placeholder="Pilih tipe lengan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pendek">
                                                Lengan Pendek (IPNU)
                                            </SelectItem>
                                            <SelectItem value="panjang">
                                                Lengan Panjang (IPPNU/IPNU)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Berkas */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="border-b border-gray-100 pb-2 text-lg font-bold text-gray-900">
                                    3. Unggah Berkas & Dokumen
                                </h2>
                                <p className="mt-2 text-xs font-medium text-gray-500">
                                    Unggah semua berkas persyaratan berikut.
                                    Ukuran maksimal per file adalah 10MB.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {FILE_FIELDS.map((field) => (
                                    <div
                                        key={field.key}
                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-[#1a4d2e]/30 hover:bg-[#1a4d2e]/5"
                                    >
                                        <Label className="mb-1 block font-bold text-gray-700">
                                            {field.label}
                                        </Label>
                                        <span className="mb-3 block text-[10px] text-gray-400">
                                            {field.desc}
                                        </span>

                                        <div className="relative flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white transition-colors hover:bg-gray-50">
                                            <input
                                                type="file"
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                accept={
                                                    field.key === 'fotoFormal'
                                                        ? 'image/jpeg,image/png'
                                                        : 'application/pdf,image/jpeg,image/png'
                                                }
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0] ||
                                                        null;
                                                    handleFileChange(
                                                        field.key,
                                                        file,
                                                    );
                                                }}
                                                required
                                            />
                                            {files[field.key] ? (
                                                <div className="px-4 text-center">
                                                    <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-emerald-500" />
                                                    <span className="block w-full truncate text-[10px] font-bold text-emerald-700">
                                                        {files[field.key]?.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="px-4 text-center">
                                                    <Upload className="mx-auto mb-1 h-5 w-5 text-gray-400 group-hover:text-[#1a4d2e]" />
                                                    <span className="block text-[10px] font-bold text-gray-400 group-hover:text-[#1a4d2e]">
                                                        Pilih File
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8 text-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-14 w-full max-w-sm rounded-xl bg-[#1a4d2e] px-8 text-sm font-bold shadow-lg shadow-green-900/20 hover:bg-[#123620]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Mengunggah & Menyimpan...
                                    </>
                                ) : (
                                    'Kirim Pendaftaran'
                                )}
                            </Button>
                            <p className="mt-4 text-xs font-medium text-gray-400">
                                Pastikan semua data dan berkas sudah benar
                                sebelum mengirimkan formulir.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
