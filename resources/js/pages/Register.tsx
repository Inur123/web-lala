import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    Eye,
    FileText,
    ImageIcon,
    Loader2,
    Upload,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import AppLogoIcon from '@/components/app-logo-icon';
import TurnstileWidget from '@/components/turnstile-widget';
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
    AttachmentTrigger,
} from '@/components/ui/attachment';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const FILE_FIELDS = [
    {
        key: 'sertifikatMakesta',
        label: 'Sertifikat MAKESTA',
        description: 'PDF, maksimal 10 MB',
        accept: 'application/pdf,.pdf',
        kind: 'pdf',
    },
    {
        key: 'sertifikatLakmud',
        label: 'Sertifikat LAKMUD',
        description: 'PDF, maksimal 10 MB',
        accept: 'application/pdf,.pdf',
        kind: 'pdf',
    },
    {
        key: 'rekomendasi',
        label: 'Surat Rekomendasi PAC / PC',
        description: 'PDF, maksimal 10 MB',
        accept: 'application/pdf,.pdf',
        kind: 'pdf',
    },
    {
        key: 'essay',
        label: 'Esai Karya Tulis',
        description: 'PDF, maksimal 10 MB',
        accept: 'application/pdf,.pdf',
        kind: 'pdf',
    },
    {
        key: 'ktpKta',
        label: 'Kartu Tanda Penduduk (KTP)',
        description: 'PDF atau gambar, maksimal 10 MB',
        accept: 'application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png',
        kind: 'mixed',
    },
    {
        key: 'formulir',
        label: 'Scan Formulir Pendaftaran',
        description: 'PDF, maksimal 10 MB',
        accept: 'application/pdf,.pdf',
        kind: 'pdf',
    },
    {
        key: 'paktaIntegritas',
        label: 'Pakta Integritas Bermaterai',
        description: 'PDF atau gambar, maksimal 10 MB',
        accept: 'application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png',
        kind: 'mixed',
    },
    {
        key: 'fotoFormal',
        label: 'Foto Formal 3×4',
        description: 'Background merah, JPG/PNG, maksimal 10 MB',
        accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
        kind: 'image',
    },
] as const;

type FileKey = (typeof FILE_FIELDS)[number]['key'];
type FileField = (typeof FILE_FIELDS)[number];

const REQUIRED_TEXT_FIELDS = [
    'name',
    'gender',
    'delegation',
    'reason',
    'whatsapp',
    'birthDate',
    'email',
] as const;

const FIELD_LABELS: Record<(typeof REQUIRED_TEXT_FIELDS)[number], string> = {
    name: 'Nama Lengkap',
    gender: 'Jenis Kelamin',
    delegation: 'Delegasi / Utusan',
    reason: 'Alasan Mengikuti Pelatihan',
    whatsapp: 'Nomor WhatsApp',
    birthDate: 'Tanggal Lahir',
    email: 'Alamat Email',
};

const initialData = {
    name: '',
    gender: '',
    delegation: '',
    reason: '',
    whatsapp: '',
    birthDate: '',
    email: '',
};

function readableFileSize(bytes: number) {
    return bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isFileAllowed(field: FileField, file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isPdf = file.type === 'application/pdf' || extension === 'pdf';
    const isImage =
        ['image/jpeg', 'image/png'].includes(file.type) ||
        ['jpg', 'jpeg', 'png'].includes(extension ?? '');

    if (field.kind === 'pdf') return isPdf;
    if (field.kind === 'image') return isImage;
    return isPdf || isImage;
}

export default function Register({
    isOpen,
    turnstileSiteKey,
}: {
    isOpen: boolean;
    turnstileSiteKey?: string | null;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileResetKey, setTurnstileResetKey] = useState(0);
    const [data, setData] = useState(initialData);
    const [files, setFiles] = useState<Partial<Record<FileKey, File>>>({});
    const [previews, setPreviews] = useState<Partial<Record<FileKey, string>>>(
        {},
    );
    const previewUrls = useRef<Partial<Record<FileKey, string>>>({});

    useEffect(() => {
        return () => {
            Object.values(previewUrls.current).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleChange = (key: keyof typeof initialData, value: string) => {
        // Sanitasi input di sisi frontend
        let sanitized = value;
        if (key === 'name') {
            // Hanya huruf, spasi, titik, koma, tanda hubung, apostrof
            sanitized = value.replace(
                /[^a-zA-Z\u00C0-\u024F\u0400-\u04FF\s.',-]/g,
                '',
            );
        } else if (key === 'delegation') {
            // Huruf, angka, spasi, titik, koma, tanda hubung, garis miring
            sanitized = value.replace(
                /[^a-zA-Z\u00C0-\u024F\u0400-\u04FF\d\s.',/-]/g,
                '',
            );
        } else if (key === 'whatsapp') {
            // Hanya angka dan tanda + di awal
            sanitized = value.replace(/[^0-9+]/g, '');
            // Tanda + hanya boleh di awal
            if (sanitized.indexOf('+') > 0) {
                sanitized = sanitized.replace(/\+/g, '');
            }
        }
        setData((current) => ({ ...current, [key]: sanitized }));
    };

    const handleFileChange = (field: FileField, file: File | null) => {
        const oldUrl = previewUrls.current[field.key];
        if (oldUrl) URL.revokeObjectURL(oldUrl);

        if (!file) {
            delete previewUrls.current[field.key];
            setFiles((current) => {
                const next = { ...current };
                delete next[field.key];
                return next;
            });
            setPreviews((current) => {
                const next = { ...current };
                delete next[field.key];
                return next;
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error(`${field.label} melebihi batas 10 MB.`);
            return;
        }
        if (!isFileAllowed(field, file)) {
            toast.error(`Format berkas ${field.label} tidak sesuai.`);
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        previewUrls.current[field.key] = previewUrl;
        setFiles((current) => ({ ...current, [field.key]: file }));
        setPreviews((current) => ({ ...current, [field.key]: previewUrl }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        for (const field of REQUIRED_TEXT_FIELDS) {
            if (!data[field]) {
                toast.error(`${FIELD_LABELS[field]} wajib diisi.`);
                return;
            }
        }
        for (const field of FILE_FIELDS) {
            if (!files[field.key]) {
                toast.error(`${field.label} wajib diunggah.`);
                return;
            }
        }
        if (turnstileSiteKey && !turnstileToken) {
            toast.error('Selesaikan verifikasi keamanan terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) =>
            formData.append(key, value),
        );
        FILE_FIELDS.forEach((field) => {
            const file = files[field.key];
            if (file) formData.append(field.key, file);
        });
        formData.append('cf-turnstile-response', turnstileToken);

        try {
            const response = await axios.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                toast.success('Pendaftaran berhasil dikirim!');
                setSuccess(true);
            }
        } catch (error: unknown) {
            const responseData = axios.isAxiosError(error)
                ? error.response?.data
                : null;
            const validationErrors = responseData?.errors as
                | Record<string, string[]>
                | undefined;
            const message =
                responseData?.error ??
                (validationErrors
                    ? Object.values(validationErrors)[0]?.[0]
                    : null) ??
                responseData?.message;
            toast.error(
                message ?? 'Gagal mengirim pendaftaran. Silakan coba lagi.',
            );
            setTurnstileToken('');
            setTurnstileResetKey((current) => current + 1);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || success) {
        const registrationSucceeded = success;
        return (
            <main className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
                <Head
                    title={
                        registrationSucceeded
                            ? 'Pendaftaran Berhasil'
                            : 'Pendaftaran Ditutup'
                    }
                />
                <Card className="w-full max-w-md text-center">
                    <CardHeader className="items-center">
                        <div
                            className={cn(
                                'mb-2 flex size-16 items-center justify-center rounded-full',
                                registrationSucceeded
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-destructive/10 text-destructive',
                            )}
                        >
                            {registrationSucceeded ? (
                                <CheckCircle2 className="size-8" />
                            ) : (
                                <AlertCircle className="size-8" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {registrationSucceeded
                                ? 'Pendaftaran Berhasil!'
                                : 'Pendaftaran Ditutup'}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                            {registrationSucceeded
                                ? 'Data dan berkas Anda telah tersimpan. Kami telah mengirimkan email konfirmasi ke alamat email Anda. Silakan cek inbox atau folder spam untuk melihat detail pendaftaran dan link grup WhatsApp.'
                                : 'Formulir LATIN & LATPEL 2026 sedang ditutup oleh panitia.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link
                                href={
                                    registrationSucceeded ? '/pendaftar' : '/'
                                }
                            >
                                {registrationSucceeded
                                    ? 'Cek Status Pendaftaran'
                                    : 'Kembali ke Beranda'}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    const selectedBirthDate = data.birthDate
        ? new Date(`${data.birthDate}T00:00:00`)
        : undefined;

    return (
        <main className="bg-muted/30 min-h-screen py-8 lg:py-10">
            <Head title="Formulir Pendaftaran - LATIN & LATPEL 2026" />

            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <header className="mb-6 space-y-5">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ChevronLeft /> Kembali ke Beranda
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <AppLogoIcon className="size-14 shrink-0 mix-blend-multiply" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                Formulir Pendaftaran
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                LATIN & LATPEL PC IPNU IPPNU Kabupaten Magetan
                                2026
                            </p>
                        </div>
                    </div>
                </header>

                <Card>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <section className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        1. Biodata Diri
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Isi identitas sesuai dokumen resmi yang
                                        diunggah.
                                    </p>
                                </div>
                                <Separator />

                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Nama Lengkap (Sesuai KTP)
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(event) =>
                                                handleChange(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Masukkan nama lengkap"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Jenis Kelamin</Label>
                                        <Select
                                            value={data.gender}
                                            onValueChange={(value) =>
                                                handleChange('gender', value)
                                            }
                                            required
                                        >
                                            <SelectTrigger className="w-full">
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
                                        <Label>Tanggal Lahir</Label>
                                        <Popover
                                            open={calendarOpen}
                                            onOpenChange={setCalendarOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        'border-input focus-visible:border-ring w-full justify-start text-left font-normal focus-visible:ring-0',
                                                        !selectedBirthDate &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarDays />
                                                    {selectedBirthDate
                                                        ? format(
                                                              selectedBirthDate,
                                                              'dd MMMM yyyy',
                                                              { locale: id },
                                                          )
                                                        : 'Pilih tanggal lahir'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedBirthDate}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            handleChange(
                                                                'birthDate',
                                                                format(
                                                                    date,
                                                                    'yyyy-MM-dd',
                                                                ),
                                                            );
                                                            setCalendarOpen(
                                                                false,
                                                            );
                                                        }
                                                    }}
                                                    captionLayout="dropdown"
                                                    startMonth={
                                                        new Date(1990, 0)
                                                    }
                                                    endMonth={
                                                        new Date(2015, 11)
                                                    }
                                                    disabled={{
                                                        after: new Date(),
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="delegation">
                                            Delegasi / Utusan (PAC / PC)
                                        </Label>
                                        <Input
                                            id="delegation"
                                            value={data.delegation}
                                            onChange={(event) =>
                                                handleChange(
                                                    'delegation',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Contoh: PAC IPNU Magetan"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">
                                            No. WhatsApp Aktif
                                        </Label>
                                        <Input
                                            id="whatsapp"
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="[0-9+]*"
                                            value={data.whatsapp}
                                            onChange={(event) =>
                                                handleChange(
                                                    'whatsapp',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="08xxxx"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Alamat Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(event) =>
                                                handleChange(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                        <Label htmlFor="reason">
                                            Alasan Mengikuti Pelatihan
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            value={data.reason}
                                            onChange={(event) =>
                                                handleChange(
                                                    'reason',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Tuliskan alasan atau motivasi Anda secara singkat dan jelas."
                                            className="min-h-24"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        2. Unggah Berkas & Dokumen
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Pilih berkas sesuai format. Klik berkas
                                        terpilih untuk membukanya di tab baru.
                                    </p>
                                </div>
                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {FILE_FIELDS.map((field) => {
                                        const file = files[field.key];
                                        const preview = previews[field.key];
                                        const imageFile =
                                            file?.type.startsWith('image/');
                                        const inputId = `file-${field.key}`;

                                        return (
                                            <div
                                                key={field.key}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor={inputId}>
                                                    {field.label}
                                                </Label>
                                                <input
                                                    id={inputId}
                                                    type="file"
                                                    accept={field.accept}
                                                    className="sr-only"
                                                    onChange={(event) => {
                                                        handleFileChange(
                                                            field,
                                                            event.target
                                                                .files?.[0] ??
                                                                null,
                                                        );
                                                        event.target.value = '';
                                                    }}
                                                />

                                                {file && preview ? (
                                                    <Attachment className="w-full">
                                                        <AttachmentMedia
                                                            variant={
                                                                imageFile
                                                                    ? 'image'
                                                                    : 'icon'
                                                            }
                                                        >
                                                            {imageFile ? (
                                                                <img
                                                                    src={
                                                                        preview
                                                                    }
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <FileText />
                                                            )}
                                                        </AttachmentMedia>
                                                        <AttachmentContent>
                                                            <AttachmentTitle>
                                                                {file.name}
                                                            </AttachmentTitle>
                                                            <AttachmentDescription>
                                                                {readableFileSize(
                                                                    file.size,
                                                                )}{' '}
                                                                · Klik untuk
                                                                lihat
                                                            </AttachmentDescription>
                                                        </AttachmentContent>
                                                        <AttachmentActions>
                                                            <AttachmentAction
                                                                asChild
                                                                aria-label={`Lihat ${field.label}`}
                                                            >
                                                                <a
                                                                    href={
                                                                        preview
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Eye />
                                                                </a>
                                                            </AttachmentAction>
                                                            <AttachmentAction
                                                                type="button"
                                                                aria-label={`Hapus ${field.label}`}
                                                                onClick={() =>
                                                                    handleFileChange(
                                                                        field,
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                <X />
                                                            </AttachmentAction>
                                                        </AttachmentActions>
                                                        <AttachmentTrigger
                                                            asChild
                                                        >
                                                            <a
                                                                href={preview}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={`Buka pratinjau ${field.label}`}
                                                            />
                                                        </AttachmentTrigger>
                                                    </Attachment>
                                                ) : (
                                                    <Attachment
                                                        state="idle"
                                                        className="min-h-20 w-full"
                                                    >
                                                        <AttachmentMedia>
                                                            {field.kind ===
                                                            'image' ? (
                                                                <ImageIcon />
                                                            ) : (
                                                                <Upload />
                                                            )}
                                                        </AttachmentMedia>
                                                        <AttachmentContent>
                                                            <AttachmentTitle>
                                                                Pilih berkas
                                                            </AttachmentTitle>
                                                            <AttachmentDescription>
                                                                {
                                                                    field.description
                                                                }
                                                            </AttachmentDescription>
                                                        </AttachmentContent>
                                                        <AttachmentTrigger
                                                            type="button"
                                                            aria-label={`Pilih ${field.label}`}
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        inputId,
                                                                    )
                                                                    ?.click()
                                                            }
                                                        />
                                                    </Attachment>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <Separator />
                            <div className="space-y-3">
                                <TurnstileWidget
                                    siteKey={turnstileSiteKey}
                                    action="registration"
                                    resetKey={turnstileResetKey}
                                    onVerify={setTurnstileToken}
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={
                                        isSubmitting ||
                                        (Boolean(turnstileSiteKey) &&
                                            !turnstileToken)
                                    }
                                    className="w-full bg-[#1a4d2e] hover:bg-[#123620]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Mengunggah dan menyimpan...
                                        </>
                                    ) : (
                                        'Kirim Pendaftaran'
                                    )}
                                </Button>
                                <p className="text-muted-foreground text-center text-xs">
                                    Pastikan seluruh data dan berkas sudah benar
                                    sebelum dikirim.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
