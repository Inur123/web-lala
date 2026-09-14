import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Search,
    Users,
    XCircle,
} from 'lucide-react';
import axios from 'axios';
import AppLogoIcon from '@/components/app-logo-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type RegistrationStatus = 'pending' | 'lolos' | 'ditolak';

type RegistrantPublic = {
    id: string;
    name: string;
    gender: string;
    delegation: string;
    adminStatus: RegistrationStatus;
    screeningStatus: RegistrationStatus;
    photoUrl?: string;
};

const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu',
        icon: Clock,
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    lolos: {
        label: 'Lolos',
        icon: CheckCircle2,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    ditolak: {
        label: 'Ditolak',
        icon: XCircle,
        className: 'border-red-200 bg-red-50 text-red-700',
    },
} satisfies Record<
    RegistrationStatus,
    { label: string; icon: typeof Clock; className: string }
>;

function StatusBadge({ status }: { status: RegistrationStatus }) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={config.className}>
            <Icon />
            {config.label}
        </Badge>
    );
}

function RegistrantAvatar({ registrant }: { registrant: RegistrantPublic }) {
    const avatar = (
        <Avatar className="size-10 border">
            {registrant.photoUrl ? (
                <AvatarImage
                    src={registrant.photoUrl}
                    alt={`Foto ${registrant.name}`}
                    className="object-cover"
                />
            ) : null}
            <AvatarFallback>
                {registrant.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );

    if (!registrant.photoUrl) return avatar;

    return (
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <a
                href={registrant.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buka foto ${registrant.name}`}
            >
                {avatar}
            </a>
        </Button>
    );
}

export default function Pendaftar() {
    const [registrants, setRegistrants] = useState<RegistrantPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchRegistrants = async () => {
            try {
                const response = await axios.get('/api/public/registrants');
                setRegistrants(response.data.registrants ?? []);
            } catch {
                setFailed(true);
            } finally {
                setLoading(false);
            }
        };

        void fetchRegistrants();
    }, []);

    const keyword = search.trim().toLowerCase();
    const filteredRegistrants = registrants.filter(
        (registrant) =>
            registrant.name.toLowerCase().includes(keyword) ||
            registrant.delegation.toLowerCase().includes(keyword),
    );

    return (
        <main className="bg-muted/30 min-h-screen py-8 lg:py-10">
            <Head title="Data Pendaftar - LATIN & LATPEL 2026" />

            <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                        <ChevronLeft /> Kembali ke Beranda
                    </Link>
                </Button>

                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-center gap-4">
                        <AppLogoIcon className="size-14 shrink-0 object-contain" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                Data Pendaftar
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Total {registrants.length} calon peserta
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full md:max-w-sm">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama atau delegasi..."
                            className="bg-background pl-9"
                            aria-label="Cari nama atau delegasi"
                        />
                    </div>
                </header>

                {failed ? (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertTitle>Data belum dapat dimuat</AlertTitle>
                        <AlertDescription>
                            Silakan buka kembali halaman ini beberapa saat lagi.
                        </AlertDescription>
                    </Alert>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Peserta</CardTitle>
                        <CardDescription>
                            Status administrasi dan screening peserta LATIN &
                            LATPEL 2026.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        {loading ? (
                            <div className="space-y-3 px-6">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-14 w-full"
                                    />
                                ))}
                            </div>
                        ) : filteredRegistrants.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-2 px-6 text-center">
                                <Users className="text-muted-foreground size-10" />
                                <h2 className="font-semibold">
                                    Pendaftar tidak ditemukan
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Belum ada data atau kata kunci tidak cocok.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y md:hidden">
                                    {filteredRegistrants.map(
                                        (registrant, index) => (
                                            <article
                                                key={registrant.id}
                                                className="p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <RegistrantAvatar
                                                        registrant={registrant}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold">
                                                                    {registrant.name}
                                                                </p>
                                                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                                    <p className="text-muted-foreground text-xs">
                                                                        {index + 1}.{' '}
                                                                        {registrant.gender === 'Laki-laki' || registrant.gender === 'l' ? 'Laki-laki (IPNU)' : 'Perempuan (IPPNU)'}
                                                                    </p>
                                                                    <span className="text-muted-foreground text-[10px]">•</span>
                                                                    <span className="text-muted-foreground truncate text-xs">
                                                                        {registrant.delegation}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                                            <div className="rounded-xl bg-slate-50 p-2.5">
                                                                <p className="text-muted-foreground mb-1.5 text-[10px] font-medium uppercase">
                                                                    Administrasi
                                                                </p>
                                                                <StatusBadge
                                                                    status={
                                                                        registrant.adminStatus
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="rounded-xl bg-slate-50 p-2.5">
                                                                <p className="text-muted-foreground mb-1.5 text-[10px] font-medium uppercase">
                                                                    Screening
                                                                </p>
                                                                <StatusBadge
                                                                    status={
                                                                        registrant.screeningStatus
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ),
                                    )}
                                </div>

                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-14 text-center">
                                                    No
                                                </TableHead>
                                                <TableHead>Peserta</TableHead>
                                                <TableHead>Delegasi</TableHead>
                                                <TableHead>
                                                    Administrasi
                                                </TableHead>
                                                <TableHead>Screening</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRegistrants.map(
                                                (registrant, index) => (
                                                    <TableRow
                                                        key={registrant.id}
                                                    >
                                                        <TableCell className="text-muted-foreground text-center font-medium">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <RegistrantAvatar
                                                                    registrant={
                                                                        registrant
                                                                    }
                                                                />
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {
                                                                            registrant.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-muted-foreground text-xs">
                                                                        {registrant.gender ===
                                                                            'Laki-laki' ||
                                                                        registrant.gender ===
                                                                            'l'
                                                                            ? 'Laki-laki (IPNU)'
                                                                            : 'Perempuan (IPPNU)'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                {
                                                                    registrant.delegation
                                                                }
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                status={
                                                                    registrant.adminStatus
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                status={
                                                                    registrant.screeningStatus
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
