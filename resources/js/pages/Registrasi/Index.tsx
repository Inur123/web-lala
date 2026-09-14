import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    BadgeCheck,
    BadgeX,
    ClipboardList,
    Clock3,
    Eye,
    FileDown,
    QrCode,
    Loader2,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import { fileUrl } from '@/lib/file-url';
import { formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RegFile = {
    id: string;
    field_key: string;
};

type Registrant = {
    id: string;
    name: string;
    gender: string;
    delegation: string;
    admin_status: 'pending' | 'lolos' | 'ditolak';
    admin_reviewed_at: string | null;
    screening_status: 'pending' | 'lolos' | 'ditolak';
    screening_reviewed_at: string | null;
    created_at: string;
    files?: RegFile[];
};

type Stage = 'administrasi' | 'screening';
type Status = Registrant['admin_status'];

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    lolos: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    ditolak: 'bg-red-50 text-red-600 border border-red-200',
};

const STATUS_LABEL: Record<string, string> = {
    pending: 'Menunggu',
    lolos: 'Lolos',
    ditolak: 'Ditolak',
};

function safeSpreadsheetValue(value: string): string {
    return /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
}

function StatusBadge({ status }: { status: Status }) {
    return (
        <Badge variant="outline" className={STATUS_BADGE[status]}>
            {STATUS_LABEL[status]}
        </Badge>
    );
}

export default function RegistrasiIndex({
    registrants,
}: {
    registrants: Registrant[];
}) {
    const [activeTab, setActiveTab] = useState<Stage>('administrasi');
    const [isDownloadingAllQr, setIsDownloadingAllQr] = useState(false);
    const data = registrants;

    const handleDownloadAllQr = () => {
        const lolosCount = registrants.filter(
            (r) => r.screening_status === 'lolos',
        ).length;
        if (lolosCount === 0) {
            toast.error('Belum ada peserta dengan status lolos screening.');
            return;
        }

        setIsDownloadingAllQr(true);
        toast.info(
            `Menyiapkan ${lolosCount} QR Code peserta lolos screening...`,
        );

        window.location.href = '/registrasi/download-qr-all';

        setTimeout(() => {
            setIsDownloadingAllQr(false);
        }, 2500);
    };

    const filteredData =
        activeTab === 'administrasi'
            ? data
            : data.filter((r) => r.admin_status === 'lolos');

    const adminPending = data.filter(
        (r) => r.admin_status === 'pending',
    ).length;
    const adminLolos = data.filter((r) => r.admin_status === 'lolos').length;
    const adminDitolak = data.filter(
        (r) => r.admin_status === 'ditolak',
    ).length;
    const screeningPending = data.filter(
        (r) => r.admin_status === 'lolos' && r.screening_status === 'pending',
    ).length;
    const screeningLolos = data.filter(
        (r) => r.screening_status === 'lolos',
    ).length;
    const screeningDitolak = data.filter(
        (r) => r.admin_status === 'lolos' && r.screening_status === 'ditolak',
    ).length;

    const handleExportExcel = () => {
        if (data.length === 0) {
            toast.error('Tidak ada data untuk diexport.');
            return;
        }

        try {
            const mapRegistrantRow = (item: Registrant, index: number) => ({
                No: index + 1,
                'Nama Peserta': safeSpreadsheetValue(item.name),
                'Jenis Kelamin':
                    item.gender === 'l' || item.gender === 'Laki-laki'
                        ? 'Laki-laki'
                        : 'Perempuan',
                'Delegation/Utusan': safeSpreadsheetValue(item.delegation),
                'Status Administrasi':
                    STATUS_LABEL[item.admin_status] || item.admin_status,
                'Status Screening':
                    STATUS_LABEL[item.screening_status] ||
                    item.screening_status,
                'Tanggal Mendaftar': formatDate(item.created_at, 'long'),
            });

            const allPendaftar = data;
            const lolosAdministrasi = data.filter(
                (r) => r.admin_status === 'lolos',
            );
            const lolosScreening = data.filter(
                (r) => r.screening_status === 'lolos',
            );

            void import('xlsx-js-style').then((xlsx) => {
                const workbook = xlsx.utils.book_new();

                const createSheetWithSummary = (
                    dataset: Registrant[],
                    sheetName: string,
                ) => {
                    const rows = dataset.map((item, index) =>
                        mapRegistrantRow(item, index),
                    );

                    const totalLaki = dataset.filter(
                        (r) => r.gender === 'l' || r.gender === 'Laki-laki',
                    ).length;
                    const totalPerempuan = dataset.filter(
                        (r) => r.gender === 'p' || r.gender === 'Perempuan',
                    ).length;

                    const finalRows: Record<string, string | number>[] = [
                        ...rows,
                    ];
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
                        'Jenis Kelamin': dataset.length,
                    });

                    if (sheetName === 'Semua Pendaftar') {
                        const statusAdminLolos = dataset.filter(
                            (r) => r.admin_status === 'lolos',
                        ).length;
                        const statusAdminDitolak = dataset.filter(
                            (r) => r.admin_status === 'ditolak',
                        ).length;
                        const statusAdminPending = dataset.filter(
                            (r) => r.admin_status === 'pending',
                        ).length;

                        const statusScrLolos = dataset.filter(
                            (r) => r.screening_status === 'lolos',
                        ).length;
                        const statusScrDitolak = dataset.filter(
                            (r) => r.screening_status === 'ditolak',
                        ).length;
                        const statusScrPending = dataset.filter(
                            (r) =>
                                r.admin_status === 'lolos' &&
                                r.screening_status === 'pending',
                        ).length;

                        finalRows.push({}, {});
                        finalRows.push({
                            'Nama Peserta': '■ STATUS SELEKSI ADMINISTRASI',
                        });
                        finalRows.push({
                            'Nama Peserta': '  - Lolos Administrasi',
                            'Jenis Kelamin': statusAdminLolos,
                        });
                        finalRows.push({
                            'Nama Peserta': '  - Ditolak Administrasi',
                            'Jenis Kelamin': statusAdminDitolak,
                        });
                        finalRows.push({
                            'Nama Peserta': '  - Menunggu Review',
                            'Jenis Kelamin': statusAdminPending,
                        });

                        finalRows.push({}, {});
                        finalRows.push({
                            'Nama Peserta': '■ STATUS SELEKSI SCREENING',
                        });
                        finalRows.push({
                            'Nama Peserta': '  - Lolos Screening',
                            'Jenis Kelamin': statusScrLolos,
                        });
                        finalRows.push({
                            'Nama Peserta': '  - Ditolak Screening',
                            'Jenis Kelamin': statusScrDitolak,
                        });
                        finalRows.push({
                            'Nama Peserta': '  - Menunggu Screening',
                            'Jenis Kelamin': statusScrPending,
                        });
                    }

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

                                if (
                                    C === 0 ||
                                    C === 2 ||
                                    C === 4 ||
                                    C === 5 ||
                                    C === 6
                                ) {
                                    cell.s.alignment.horizontal = 'center';
                                }
                            } else {
                                const cellValue = String(cell.v || '');
                                if (
                                    cellValue.includes('RINGKASAN') ||
                                    cellValue.includes('STATUS SELEKSI')
                                ) {
                                    cell.s.font.bold = true;
                                    cell.s.font.size = 11;
                                    cell.s.font.color = { rgb: '1A4D2E' };
                                }
                                if (C === 0) {
                                    if (
                                        cellValue.startsWith('•') ||
                                        cellValue.startsWith('  -') ||
                                        cellValue.startsWith('■')
                                    ) {
                                        cell.s.font.bold =
                                            cellValue.startsWith('■');
                                    }
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
                        if (key === 'Status Administrasi')
                            width = Math.max(width, 24);
                        if (key === 'Status Screening')
                            width = Math.max(width, 22);
                        if (key === 'Tanggal Mendaftar')
                            width = Math.max(width, 24);
                        if (key === 'Jenis Kelamin')
                            width = Math.max(width, 18);
                        return { wch: Math.min(width, 50) };
                    });

                    return worksheet;
                };

                const sheetAll = createSheetWithSummary(
                    allPendaftar,
                    'Semua Pendaftar',
                );
                const sheetAdmin = createSheetWithSummary(
                    lolosAdministrasi,
                    'Lolos Administrasi',
                );
                const sheetScreening = createSheetWithSummary(
                    lolosScreening,
                    'Lolos Screening',
                );

                xlsx.utils.book_append_sheet(
                    workbook,
                    sheetAll,
                    'Semua Pendaftar',
                );
                xlsx.utils.book_append_sheet(
                    workbook,
                    sheetAdmin,
                    'Lolos Administrasi',
                );
                xlsx.utils.book_append_sheet(
                    workbook,
                    sheetScreening,
                    'Lolos Screening',
                );

                xlsx.writeFile(
                    workbook,
                    `Data_Seleksi_Latin_Latpel_${new Date().getFullYear()}.xlsx`,
                );
                toast.success('Berhasil mengekspor data Excel.');
            });
        } catch (err) {
            console.error(err);
            toast.error('Gagal mengekspor data ke Excel.');
        }
    };

    const statistics = [
        {
            label: 'Total Pendaftar',
            value: data.length,
            description: 'Seluruh peserta terdaftar',
            icon: Users,
        },
        {
            label: 'Admin Menunggu',
            value: adminPending,
            description: 'Perlu ditinjau admin',
            icon: Clock3,
        },
        {
            label: 'Admin Lolos',
            value: adminLolos,
            description: 'Berkas telah diterima',
            icon: UserCheck,
        },
        {
            label: 'Admin Ditolak',
            value: adminDitolak,
            description: 'Berkas tidak memenuhi syarat',
            icon: UserX,
        },
        {
            label: 'Screening Lolos',
            value: screeningLolos,
            description: 'Lolos tahap screening',
            icon: BadgeCheck,
        },
        {
            label: 'Screening Ditolak',
            value: screeningDitolak,
            description: 'Tidak lolos screening',
            icon: BadgeX,
        },
    ];

    return (
        <>
            <Head title="Seleksi Peserta" />

            <div className="flex w-full flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Seleksi Peserta
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola tahapan administrasi dan screening peserta
                            LATIN & LATPEL 2026.
                        </p>
                    </div>
                    <div className="hidden items-center gap-2.5 md:flex">
                        <Button
                            onClick={handleExportExcel}
                            className="w-full justify-center sm:w-auto"
                        >
                            <FileDown className="mr-2 h-4 w-4" /> Ekspor Excel
                        </Button>
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
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                    {statistics.map((statistic) => (
                        <Card
                            key={statistic.label}
                            className="flex h-full flex-col justify-between gap-2 py-4 sm:gap-3"
                        >
                            <CardHeader className="flex flex-row items-start justify-between gap-1 space-y-0 px-3 pb-0 sm:px-4">
                                <CardTitle className="text-muted-foreground truncate text-xs font-medium sm:text-sm">
                                    {statistic.label}
                                </CardTitle>
                                <statistic.icon className="text-muted-foreground shrink-0 size-3.5 sm:size-4" />
                            </CardHeader>
                            <CardContent className="mt-auto px-3 sm:px-4">
                                <p className="text-xl font-semibold tabular-nums sm:text-2xl">
                                    {statistic.value}
                                </p>
                                <p className="text-muted-foreground mt-1 truncate text-[10px] sm:text-xs">
                                    {statistic.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as Stage)}
                    className="space-y-4"
                >
                    <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
                        <TabsTrigger
                            value="administrasi"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:py-1 sm:text-sm"
                        >
                            <ClipboardList className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">
                                Seleksi Administrasi
                            </span>
                            {adminPending > 0 ? (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 px-1.5 py-0 text-[10px]"
                                >
                                    {adminPending}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="screening"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:py-1 sm:text-sm"
                        >
                            <Users className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">Seleksi Screening</span>
                            {screeningPending > 0 ? (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 px-1.5 py-0 text-[10px]"
                                >
                                    {screeningPending}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === 'screening' ? (
                        <Alert>
                            <Users />
                            <AlertDescription>
                                Menampilkan {filteredData.length} peserta yang
                                lolos seleksi administrasi.
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="space-y-4 md:hidden">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold tracking-tight">
                                {activeTab === 'administrasi'
                                    ? 'Seleksi Administrasi'
                                    : 'Seleksi Screening'}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Tinjau data peserta dan buka detail untuk
                                memberikan hasil seleksi.
                            </p>
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
                                    const currentStatus =
                                        activeTab === 'administrasi'
                                            ? registrant.admin_status
                                            : registrant.screening_status;
                                    const photoFile = registrant.files?.find(
                                        (file) =>
                                            file.field_key === 'fotoFormal',
                                    );
                                    const photoUrl = photoFile?.id
                                        ? fileUrl(photoFile.id)
                                        : null;

                                    return (
                                        <Link
                                            key={registrant.id}
                                            href={`/registrasi/${registrant.id}`}
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
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold">
                                                                {
                                                                    registrant.name
                                                                }
                                                            </p>
                                                            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                                                {
                                                                    registrant.delegation
                                                                }
                                                            </p>
                                                        </div>
                                                        <StatusBadge
                                                            status={
                                                                currentStatus
                                                            }
                                                        />
                                                    </div>
                                                    <div className="text-muted-foreground mt-3 flex items-center justify-between gap-3 text-[11px]">
                                                        <span>
                                                            {registrant.gender}
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

                    <Card className="hidden md:block">
                        <CardHeader>
                            <CardTitle>
                                {activeTab === 'administrasi'
                                    ? 'Seleksi Administrasi'
                                    : 'Seleksi Screening'}
                            </CardTitle>
                            <CardDescription>
                                Tinjau data peserta dan buka detail untuk
                                memberikan hasil seleksi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            {filteredData.length === 0 ? (
                                <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 text-center">
                                    <Users className="text-muted-foreground size-10" />
                                    <p className="font-medium">
                                        Belum ada data peserta
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Data peserta akan tampil setelah
                                        pendaftaran masuk.
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
                                                <TableHead>
                                                    Jenis Kelamin
                                                </TableHead>
                                                <TableHead>Delegasi</TableHead>
                                                <TableHead>
                                                    Tanggal Daftar
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="pr-6 text-right">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.map(
                                                (registrant, index) => {
                                                    const currentStatus =
                                                        activeTab ===
                                                        'administrasi'
                                                            ? registrant.admin_status
                                                            : registrant.screening_status;
                                                    const photoFile =
                                                        registrant.files?.find(
                                                            (file) =>
                                                                file.field_key ===
                                                                'fotoFormal',
                                                        );
                                                    const photoUrl =
                                                        photoFile?.id
                                                            ? fileUrl(
                                                                  photoFile.id,
                                                              )
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
                                                                {
                                                                    registrant.gender
                                                                }
                                                            </TableCell>
                                                            <TableCell className="max-w-52 truncate">
                                                                {
                                                                    registrant.delegation
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {formatDate(
                                                                    registrant.created_at,
                                                                    'short',
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <StatusBadge
                                                                    status={
                                                                        currentStatus
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell className="pr-6 text-right">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/registrasi/${registrant.id}`}
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
                </Tabs>

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
                    <Button
                        size="icon"
                        onClick={handleDownloadAllQr}
                        disabled={isDownloadingAllQr}
                        className="size-12 rounded-full bg-gradient-to-br from-[#28774c] to-[#12492b] text-white shadow-[0_8px_24px_rgba(22,92,54,0.28)]"
                        aria-label="Unduh semua QR peserta lolos"
                        title="Unduh semua QR"
                    >
                        {isDownloadingAllQr ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <QrCode className="size-5" />
                        )}
                    </Button>
                </div>
            </div>
        </>
    );
}

RegistrasiIndex.layout = {
    breadcrumbs: [{ title: 'Seleksi Peserta', href: '/registrasi' }],
};
