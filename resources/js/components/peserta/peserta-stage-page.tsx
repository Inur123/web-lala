import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    BadgeCheck,
    Eye,
    FileDown,
    Loader2,
    QrCode,
    Search,
    Shirt,
    UserCheck,
    Users,
} from 'lucide-react';
import { fileUrl } from '@/lib/file-url';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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

export type RegFile = {
    id: string;
    field_key: string;
};

export type PesertaRegistrant = {
    id: string;
    name: string;
    gender: string;
    shirt_size?: string | null;
    delegation: string;
    whatsapp?: string | null;
    email?: string | null;
    birth_date?: string | null;
    admin_reviewed_at?: string | null;
    screening_reviewed_at?: string | null;
    created_at: string;
    files?: RegFile[];
};

type Stage = 'administrasi' | 'screening';

function safeSpreadsheetValue(value: string): string {
    return /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
}

function normalizeGender(gender: string): 'Laki-laki' | 'Perempuan' {
    const g = gender.toLowerCase();
    return g === 'l' || g.includes('laki') ? 'Laki-laki' : 'Perempuan';
}

export function PesertaStagePage({
    stage,
    registrants,
}: {
    stage: Stage;
    registrants: PesertaRegistrant[];
}) {
    const [search, setSearch] = useState('');
    const [isDownloadingAllQr, setIsDownloadingAllQr] = useState(false);

    const isAdministrasi = stage === 'administrasi';
    const pageTitle = isAdministrasi
        ? 'Peserta Administrasi'
        : 'Peserta Screening';
    const pageDescription = isAdministrasi
        ? 'Daftar peserta yang telah dinyatakan lolos seleksi administrasi LATIN & LATPEL 2026.'
        : 'Daftar peserta yang telah dinyatakan lolos tahap screening LATIN & LATPEL 2026.';

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (keyword === '') {
            return registrants;
        }
        return registrants.filter(
            (item) =>
                item.name.toLowerCase().includes(keyword) ||
                item.delegation.toLowerCase().includes(keyword),
        );
    }, [registrants, search]);

    const totalLaki = registrants.filter(
        (r) => normalizeGender(r.gender) === 'Laki-laki',
    ).length;
    const totalPerempuan = registrants.filter(
        (r) => normalizeGender(r.gender) === 'Perempuan',
    ).length;

    const shirtBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const r of registrants) {
            const size = (r.shirt_size || '-').toUpperCase();
            if (size !== '-') {
                counts[size] = (counts[size] || 0) + 1;
            }
        }
        return Object.entries(counts)
            .map(([size, qty]) => `${size}:${qty}`)
            .join(', ');
    }, [registrants]);

    const statistics = [
        {
            label: isAdministrasi ? 'Lolos Administrasi' : 'Lolos Screening',
            value: registrants.length,
            description: isAdministrasi
                ? 'Peserta lolos administrasi'
                : 'Peserta resmi kegiatan',
            icon: isAdministrasi ? UserCheck : BadgeCheck,
        },
        {
            label: 'IPNU (Laki-laki)',
            value: totalLaki,
            description: isAdministrasi
                ? 'Kader putra lolos admin'
                : 'Calon instruktur putra',
            icon: UserCheck,
        },
        {
            label: 'IPPNU (Perempuan)',
            value: totalPerempuan,
            description: isAdministrasi
                ? 'Kader putri lolos admin'
                : 'Calon pelatih putri',
            icon: Users,
        },
        {
            label: 'Data Ukuran Kaos',
            value: registrants.filter((r) => Boolean(r.shirt_size)).length,
            description: shirtBreakdown || 'Belum ada data ukuran',
            icon: Shirt,
        },
    ];

    const handleDownloadAllQr = () => {
        if (registrants.length === 0) {
            toast.error('Belum ada peserta dengan status lolos screening.');
            return;
        }

        setIsDownloadingAllQr(true);
        toast.info(
            `Menyiapkan ${registrants.length} QR Code peserta lolos screening...`,
        );

        window.location.href = '/seleksi/download-qr-all';

        setTimeout(() => {
            setIsDownloadingAllQr(false);
        }, 2500);
    };

    const handleExportExcel = () => {
        if (registrants.length === 0) {
            toast.error('Tidak ada data untuk diexport.');
            return;
        }

        try {
            void import('xlsx-js-style').then((xlsx) => {
                const workbook = xlsx.utils.book_new();
                const sheetName = isAdministrasi
                    ? 'Lolos Administrasi'
                    : 'Lolos Screening';

                const rows = filteredData.map((item, index) => ({
                    No: index + 1,
                    'Nama Peserta': safeSpreadsheetValue(item.name),
                    'Jenis Kelamin': normalizeGender(item.gender),
                    'Ukuran Baju': item.shirt_size || '-',
                    'Delegation/Utusan': safeSpreadsheetValue(item.delegation),
                    'No. WhatsApp': item.whatsapp ? `'${item.whatsapp}` : '-',
                    'Tanggal Mendaftar': formatDate(item.created_at, 'long'),
                }));

                const finalRows: Record<string, string | number>[] = [...rows];
                finalRows.push({}, {}, {}, {});
                finalRows.push({
                    'Nama Peserta': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                });
                finalRows.push({
                    'Nama Peserta': '   RINGKASAN REKAPITULASI DATA',
                });
                finalRows.push({
                    'Nama Peserta': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                });
                finalRows.push({
                    'Nama Peserta': '• Jumlah Laki-laki',
                    'Jenis Kelamin': totalLaki,
                });
                finalRows.push({
                    'Nama Peserta': '• Jumlah Perempuan',
                    'Jenis Kelamin': totalPerempuan,
                });
                finalRows.push({
                    'Nama Peserta': '• Total Peserta',
                    'Jenis Kelamin': filteredData.length,
                });

                const worksheet = xlsx.utils.json_to_sheet(finalRows);
                const range = xlsx.utils.decode_range(
                    worksheet['!ref'] || 'A1:A1',
                );
                const totalRowsInDataset = rows.length;

                for (let R = range.s.r; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cell_ref = xlsx.utils.encode_cell({
                            r: R,
                            c: C,
                        });
                        if (!worksheet[cell_ref]) continue;

                        const cell = worksheet[cell_ref];
                        cell.s = {
                            font: { name: 'Arial', size: 10 },
                            alignment: { vertical: 'center' },
                        };

                        if (R === 0) {
                            cell.s = {
                                fill: { fgColor: { rgb: '1A4D2E' } },
                                font: {
                                    name: 'Arial',
                                    size: 11,
                                    bold: true,
                                    color: { rgb: 'FFFFFF' },
                                },
                                alignment: {
                                    horizontal: 'center',
                                    vertical: 'center',
                                },
                                border: {
                                    bottom: {
                                        style: 'medium',
                                        color: { rgb: '123620' },
                                    },
                                },
                            };
                        } else if (R <= totalRowsInDataset) {
                            const isEven = R % 2 === 0;
                            cell.s.fill = {
                                fgColor: {
                                    rgb: isEven ? 'F7F9F6' : 'FFFFFF',
                                },
                            };
                            cell.s.border = {
                                top: {
                                    style: 'thin',
                                    color: { rgb: 'E5E7EB' },
                                },
                                bottom: {
                                    style: 'thin',
                                    color: { rgb: 'E5E7EB' },
                                },
                                left: {
                                    style: 'thin',
                                    color: { rgb: 'E5E7EB' },
                                },
                                right: {
                                    style: 'thin',
                                    color: { rgb: 'E5E7EB' },
                                },
                            };

                            if (C === 0 || C === 2 || C === 3) {
                                cell.s.alignment.horizontal = 'center';
                            }
                        } else {
                            const cellValue = String(cell.v || '');
                            if (cellValue.includes('RINGKASAN')) {
                                cell.s.font.bold = true;
                                cell.s.font.size = 11;
                                cell.s.font.color = { rgb: '1A4D2E' };
                            }
                            if (C === 0 && cellValue.startsWith('•')) {
                                cell.s.font.bold = false;
                            } else if (C === 2) {
                                cell.s.font.bold = true;
                                cell.s.alignment.horizontal = 'center';
                            }
                        }
                    }
                }

                const maxLen = finalRows.reduce<Record<string, number>>(
                    (acc, row) => {
                        Object.keys(row).forEach((key) => {
                            const val = String(row[key] || '');
                            const currentMax = acc[key] || 0;
                            acc[key] = Math.max(currentMax, val.length + 4);
                        });
                        return acc;
                    },
                    {},
                );

                worksheet['!cols'] = Object.keys(maxLen).map((key) => {
                    let width = maxLen[key];
                    if (key === 'Tanggal Mendaftar')
                        width = Math.max(width, 24);
                    if (key === 'Jenis Kelamin') width = Math.max(width, 16);
                    return { wch: Math.min(width, 50) };
                });

                xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

                const filePrefix = isAdministrasi
                    ? 'Peserta_Lolos_Administrasi'
                    : 'Peserta_Lolos_Screening';
                xlsx.writeFile(
                    workbook,
                    `${filePrefix}_Latin_Latpel_${new Date().getFullYear()}.xlsx`,
                );
                toast.success('Berhasil mengekspor data Excel.');
            });
        } catch (err) {
            console.error(err);
            toast.error('Gagal mengekspor data ke Excel.');
        }
    };

    return (
        <>
            <Head title={pageTitle} />

            <div className="flex w-full flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {pageTitle}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {pageDescription}
                        </p>
                    </div>
                    <div className="hidden items-center gap-2.5 md:flex">
                        <Button
                            onClick={handleExportExcel}
                            className="w-full justify-center sm:w-auto"
                        >
                            <FileDown className="mr-2 h-4 w-4" /> Ekspor Excel
                        </Button>
                        {!isAdministrasi && (
                            <Button
                                variant="outline"
                                onClick={handleDownloadAllQr}
                                disabled={isDownloadingAllQr}
                                className="w-full justify-center border-emerald-200 bg-emerald-50/80 font-medium text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 sm:w-auto"
                            >
                                {isDownloadingAllQr ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <QrCode className="mr-2 h-4 w-4 text-emerald-600" />
                                )}
                                Unduh Semua QR (Lolos)
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {statistics.map((statistic) => (
                        <Card
                            key={statistic.label}
                            className="flex h-full flex-col justify-between gap-2 py-4 sm:gap-3"
                        >
                            <CardHeader className="flex flex-row items-start justify-between gap-1 space-y-0 px-3 pb-0 sm:px-4">
                                <CardTitle className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
                                    {statistic.label}
                                </CardTitle>
                                <statistic.icon className="text-muted-foreground size-3.5 shrink-0 sm:size-4" />
                            </CardHeader>
                            <CardContent className="mt-auto px-3 sm:px-4">
                                <p className="text-xl font-semibold tabular-nums sm:text-2xl">
                                    {statistic.value}
                                </p>
                                <p
                                    className="text-muted-foreground mt-1 truncate text-[10px] sm:text-xs"
                                    title={statistic.description}
                                >
                                    {statistic.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mobile View */}
                <div className="space-y-4 md:hidden">
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold tracking-tight">
                                {pageTitle}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Ketuk kartu peserta untuk melihat detail berkas
                                lengkap.
                            </p>
                        </div>
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari nama atau delegasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white pl-9"
                            />
                        </div>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center">
                            <Users className="text-muted-foreground size-8" />
                            <p className="text-sm font-medium">
                                Belum ada data peserta
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filteredData.map((registrant) => {
                                const photoFile = registrant.files?.find(
                                    (file) => file.field_key === 'fotoFormal',
                                );
                                const photoUrl = photoFile?.id
                                    ? fileUrl(photoFile.id)
                                    : null;

                                return (
                                    <Link
                                        key={registrant.id}
                                        href={`/seleksi/${registrant.id}`}
                                        className="bg-card text-card-foreground block rounded-xl border p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md active:scale-[0.98]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="size-11 border">
                                                {photoUrl ? (
                                                    <AvatarImage
                                                        src={photoUrl}
                                                        alt={`Foto ${registrant.name}`}
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                                <AvatarFallback>
                                                    {registrant.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {registrant.name}
                                                    </p>
                                                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                                        {registrant.delegation}
                                                    </p>
                                                </div>
                                                <div className="text-muted-foreground mt-3 flex items-center justify-between gap-3 text-[11px]">
                                                    <span>
                                                        {registrant.gender}
                                                        {registrant.shirt_size
                                                            ? ` • Kaos ${registrant.shirt_size}`
                                                            : ''}
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            registrant.created_at,
                                                            'short',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Desktop View */}
                <Card className="hidden md:block">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>{pageTitle}</CardTitle>
                            <CardDescription>
                                {isAdministrasi
                                    ? 'Daftar peserta yang telah lolos seleksi administrasi.'
                                    : 'Daftar peserta yang telah lolos tahap screening.'}
                            </CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari nama atau delegasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="px-0">
                        {filteredData.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 text-center">
                                <Users className="text-muted-foreground size-10" />
                                <p className="font-medium">
                                    Belum ada data peserta
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {search.trim() !== ''
                                        ? 'Tidak ditemukan peserta dengan kata kunci pencarian tersebut.'
                                        : isAdministrasi
                                          ? 'Peserta yang lolos tahap administrasi akan muncul di sini.'
                                          : 'Peserta yang lolos tahap screening akan muncul di sini.'}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">
                                                No.
                                            </TableHead>
                                            <TableHead>Peserta</TableHead>
                                            <TableHead>Jenis Kelamin</TableHead>
                                            <TableHead>Delegasi</TableHead>
                                            <TableHead>Kaos</TableHead>
                                            <TableHead>
                                                Tanggal Daftar
                                            </TableHead>
                                            <TableHead className="pr-6 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.map(
                                            (registrant, index) => {
                                                const photoFile =
                                                    registrant.files?.find(
                                                        (file) =>
                                                            file.field_key ===
                                                            'fotoFormal',
                                                    );
                                                const photoUrl = photoFile?.id
                                                    ? fileUrl(photoFile.id)
                                                    : null;

                                                return (
                                                    <TableRow
                                                        key={registrant.id}
                                                    >
                                                        <TableCell className="text-muted-foreground pl-6">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="size-9 border">
                                                                    {photoUrl ? (
                                                                        <AvatarImage
                                                                            src={
                                                                                photoUrl
                                                                            }
                                                                            alt={`Foto ${registrant.name}`}
                                                                            className="object-cover"
                                                                        />
                                                                    ) : null}
                                                                    <AvatarFallback>
                                                                        {registrant.name
                                                                            .substring(
                                                                                0,
                                                                                2,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium">
                                                                    {
                                                                        registrant.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {registrant.gender}
                                                        </TableCell>
                                                        <TableCell className="max-w-52 truncate">
                                                            {
                                                                registrant.delegation
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {registrant.shirt_size ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {formatDate(
                                                                registrant.created_at,
                                                                'short',
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="pr-6 text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/seleksi/${registrant.id}`}
                                                                >
                                                                    <Eye />{' '}
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            },
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Mobile Floating Action Buttons (matching Seleksi/Index.tsx) */}
                <div className="fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 flex flex-col gap-3 md:hidden">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={handleExportExcel}
                        className="size-12 rounded-full border-0 bg-white text-[#315a85] shadow-[0_8px_24px_rgba(49,90,133,0.2)]"
                        aria-label="Ekspor data peserta ke Excel"
                        title="Ekspor Excel"
                    >
                        <FileDown className="size-5" />
                    </Button>
                    {!isAdministrasi && (
                        <Button
                            size="icon"
                            onClick={handleDownloadAllQr}
                            disabled={isDownloadingAllQr}
                            className="size-12 rounded-full bg-[#1a4d2e] text-white shadow-[0_8px_24px_rgba(22,92,54,0.28)] hover:bg-[#123620]"
                            aria-label="Unduh semua QR peserta lolos"
                            title="Unduh semua QR"
                        >
                            {isDownloadingAllQr ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <QrCode className="size-5" />
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
