import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowUpRight,
    CalendarDays,
    Loader2,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function PortalSettings({
    isOpen: initialIsOpen,
}: {
    isOpen: boolean;
}) {
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [saving, setSaving] = useState(false);

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

                    <CardContent className="space-y-5">
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

                        <Alert
                            variant={isOpen ? 'default' : 'destructive'}
                            className={
                                isOpen
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : undefined
                            }
                        >
                            <ShieldCheck className="size-4" />
                            <AlertTitle>
                                Pendaftaran sedang{' '}
                                {isOpen ? 'dibuka' : 'ditutup'}
                            </AlertTitle>
                            <AlertDescription>
                                {isOpen
                                    ? 'Calon peserta dapat mengirimkan formulir dan berkas pendaftaran.'
                                    : 'Formulir tidak dapat diakses hingga pendaftaran dibuka kembali.'}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card className="gap-4 py-5">
                    <CardHeader className="px-5 pb-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="size-4" />
                            Daftar pendaftar publik
                        </CardTitle>
                        <CardDescription>
                            Lihat daftar peserta yang ditampilkan pada portal
                            publik.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <Button
                            variant="outline"
                            className="h-11 w-full justify-between rounded-xl sm:w-auto"
                            asChild
                        >
                            <Link href="/pendaftar">
                                Buka daftar pendaftar
                                <ArrowUpRight className="ml-3 size-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PortalSettings.layout = {
    breadcrumbs: [{ title: 'Pengaturan Portal', href: '/portal-settings' }],
};
