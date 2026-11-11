import { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    ArrowUpRight,
    CalendarDays,
    Info,
    Loader2,
    ShieldCheck,
    Smartphone,
    Trash2,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';
import PasswordInput from '@/components/password-input';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function PortalSettings({
    isOpen: initialIsOpen,
    totalRegistrants: initialTotalRegistrants = 0,
}: {
    isOpen: boolean;
    totalRegistrants?: number;
}) {
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [saving, setSaving] = useState(false);
    const [totalRegistrants, setTotalRegistrants] = useState(
        initialTotalRegistrants,
    );
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const { isInstallable, isIos, isStandalone, promptInstall } =
        usePwaInstall();

    const handleToggle = async (nextState: boolean) => {
        setSaving(true);

        try {
            const response = await axios.post('/portal-settings', {
                isOpen: nextState,
            });

            if (response.data.success) {
                setIsOpen(nextState);
                toast.success(response.data.message);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error ||
                    'Pengaturan gagal disimpan. Silakan coba lagi.',
            );
        } finally {
            setSaving(false);
        }
    };

    const handleResetRegistrations = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setPasswordError('Kata sandi wajib diisi.');
            return;
        }

        setPasswordError('');
        setIsResetting(true);

        try {
            const response = await axios.post(
                '/portal-settings/reset-registrations',
                { password },
            );

            if (response.data.success) {
                toast.success(response.data.message);
                setTotalRegistrants(0);
                setIsResetDialogOpen(false);
                setPassword('');
            }
        } catch (error: any) {
            const message =
                error.response?.data?.errors?.password?.[0] ||
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Gagal menghapus data. Periksa kembali kata sandi Anda.';
            setPasswordError(message);
            toast.error(message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <>
            <Head title="Pengaturan Portal" />

            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Pengaturan Portal
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola akses formulir pendaftaran LATIN & LATPEL 2026.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-6">
                            <div className="space-y-1.5">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="size-4" />
                                    Pendaftaran peserta
                                </CardTitle>
                                <CardDescription>
                                    Tentukan apakah calon peserta dapat membuka
                                    dan mengirim formulir pendaftaran.
                                </CardDescription>
                            </div>
                            <Badge
                                variant={isOpen ? 'outline' : 'destructive'}
                                className={
                                    isOpen
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : undefined
                                }
                            >
                                {isOpen ? 'Dibuka' : 'Ditutup'}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Card className="py-0 shadow-none">
                            <CardContent className="flex items-center justify-between gap-4 p-4">
                                <Label
                                    htmlFor="registration-status"
                                    className="flex-1 space-y-1"
                                >
                                    <span className="block font-medium">
                                        Akses formulir publik
                                    </span>
                                    <span className="text-muted-foreground block text-xs leading-relaxed font-normal">
                                        Perubahan langsung berlaku pada halaman
                                        pendaftaran publik.
                                    </span>
                                </Label>
                                <div className="flex items-center gap-3">
                                    {saving && (
                                        <Loader2 className="text-muted-foreground size-4 animate-spin" />
                                    )}
                                    <Switch
                                        id="registration-status"
                                        checked={isOpen}
                                        onCheckedChange={handleToggle}
                                        disabled={saving}
                                        aria-label="Ubah status pendaftaran"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <Card className="flex flex-col justify-between gap-4 py-5">
                        <CardHeader className="px-5 pb-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="size-4" />
                                Daftar pendaftar publik
                            </CardTitle>
                            <CardDescription>
                                Lihat daftar peserta yang ditampilkan pada
                                portal publik.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto px-5 pt-4">
                            <Button
                                variant="outline"
                                className="h-11 w-full justify-between rounded-xl"
                                asChild
                            >
                                <a
                                    href="/pendaftar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Buka daftar pendaftar
                                    <ArrowUpRight className="ml-3 size-4" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Aplikasi Mobile (PWA) Settings Card */}
                    <Card className="flex flex-col justify-between gap-4 py-5">
                        <CardHeader className="px-5 pb-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Smartphone className="size-4" />
                                Aplikasi Mobile (PWA)
                            </CardTitle>
                            <CardDescription>
                                Instal website ini sebagai aplikasi di perangkat
                                Anda untuk akses yang lebih cepat.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto px-5 pt-4">
                            {isStandalone ? (
                                <Alert className="border-emerald-200 bg-emerald-50 py-3 text-emerald-800">
                                    <ShieldCheck className="size-4" />
                                    <AlertTitle className="text-xs">
                                        Sudah Terinstal
                                    </AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Anda sedang menggunakan sistem ini
                                        melalui aplikasi PWA.
                                    </AlertDescription>
                                </Alert>
                            ) : isIos ? (
                                <Alert className="border-blue-200 bg-blue-50 py-3 text-blue-800">
                                    <Info className="size-4" />
                                    <AlertTitle className="text-xs">
                                        Panduan Pengguna iOS
                                    </AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Tekan ikon <strong>Share</strong> di
                                        Safari, lalu pilih{' '}
                                        <strong>Add to Home Screen</strong>.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Button
                                    onClick={() => {
                                        if (isInstallable) {
                                            void promptInstall();
                                        } else {
                                            toast.info(
                                                "Sistem menolak instalasi otomatis. Pastikan aplikasi belum terinstal, atau gunakan menu browser 'Add to Home Screen' (Tambahkan ke Layar Utama) secara manual.",
                                            );
                                        }
                                    }}
                                    className="h-11 w-full rounded-xl"
                                >
                                    Instal Aplikasi
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Zona Bahaya: Hapus Semua Peserta */}
                <Card className="border-red-200/80 bg-red-50/20 shadow-none">
                    <CardHeader className="space-y-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-600">
                                    <AlertTriangle className="size-4" />
                                    Zona Bahaya: Reset Data Pendaftar
                                </CardTitle>
                                <CardDescription className="text-xs leading-relaxed">
                                    Hapus seluruh data calon peserta yang telah
                                    mendaftar beserta seluruh berkas fisik (PDF
                                    dan foto) penyimpanan.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="w-fit border-red-200 bg-red-50 text-xs font-medium text-red-700"
                            >
                                {totalRegistrants} Peserta Terdaftar
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert
                            variant="destructive"
                            className="border-red-200 bg-red-100/60 text-red-800"
                        >
                            <AlertTriangle className="size-4 text-red-600" />
                            <AlertTitle className="text-xs font-semibold">
                                Perhatian: Tindakan ini permanen!
                            </AlertTitle>
                            <AlertDescription className="text-xs text-red-700">
                                Seluruh data pendaftar, hasil seleksi
                                administrasi & screening, serta riwayat presensi
                                terkait akan dihapus bersih tanpa bisa
                                dikembalikan.
                            </AlertDescription>
                        </Alert>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    setPassword('');
                                    setPasswordError('');
                                    setIsResetDialogOpen(true);
                                }}
                                disabled={totalRegistrants === 0 || isResetting}
                                className="h-10 rounded-xl px-4 text-xs font-medium sm:text-sm"
                            >
                                <Trash2 className="mr-2 size-4" />
                                Hapus Semua Data Peserta
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Dialog Konfirmasi Password */}
                <Dialog
                    open={isResetDialogOpen}
                    onOpenChange={(open) => {
                        if (!isResetting) {
                            setIsResetDialogOpen(open);
                            if (!open) {
                                setPassword('');
                                setPasswordError('');
                            }
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <form
                            onSubmit={handleResetRegistrations}
                            className="space-y-4"
                        >
                            <DialogHeader>
                                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 sm:mx-0">
                                    <AlertTriangle className="size-6" />
                                </div>
                                <DialogTitle className="text-left text-lg font-semibold">
                                    Konfirmasi Hapus Semua Data Peserta
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-left text-xs leading-relaxed sm:text-sm">
                                    Tindakan ini akan menghapus permanen{' '}
                                    <strong className="text-foreground">
                                        {totalRegistrants} peserta
                                    </strong>{' '}
                                    beserta seluruh berkas unggahan di server.
                                    <br />
                                    <br />
                                    Untuk melanjutkan, masukkan kata sandi akun
                                    admin Anda:
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-2 py-1">
                                <Label
                                    htmlFor="admin-password"
                                    className="text-xs font-medium sm:text-sm"
                                >
                                    Kata Sandi Akun
                                </Label>
                                <PasswordInput
                                    id="admin-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    placeholder="Masukkan kata sandi login Anda"
                                    disabled={isResetting}
                                    autoFocus
                                />
                                {passwordError && (
                                    <p className="text-xs font-medium text-red-600">
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsResetDialogOpen(false)}
                                    disabled={isResetting}
                                    className="rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={isResetting || !password}
                                    className="rounded-xl"
                                >
                                    {isResetting ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 size-4" />
                                            Ya, Hapus Semua Data
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

PortalSettings.layout = {
    breadcrumbs: [{ title: 'Pengaturan Portal', href: '/portal-settings' }],
};
