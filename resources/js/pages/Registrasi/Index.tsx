import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Users,
    ClipboardList,
    RefreshCw,
    ChevronRight,
    Eye,
    FileDown,
} from 'lucide-react';
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
    shirt_size: string;
    sleeve_type: string;
    admin_status: 'pending' | 'lolos' | 'ditolak';
    admin_reviewed_at: string | null;
    screening_status: 'pending' | 'lolos' | 'ditolak';
    screening_reviewed_at: string | null;
    created_at: string;
    files?: RegFile[];
};

type Stage = 'administrasi' | 'screening';

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

export default function RegistrasiIndex({
    registrants,
}: {
    registrants: Registrant[];
}) {
    const [activeTab, setActiveTab] = useState<Stage>('administrasi');
    const [refreshing, setRefreshing] = useState(false);
    const data = registrants;

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            only: ['registrants'],
            onFinish: () => {
                setRefreshing(false);
                toast.success('Data berhasil diperbarui');
            },
        });
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
                'Nama Peserta': item.name,
                'Jenis Kelamin':
                    item.gender === 'l' || item.gender === 'Laki-laki'
                        ? 'Laki-laki'
                        : 'Perempuan',
                'Delegation/Utusan': item.delegation,
                'Ukuran Kaos': item.shirt_size,
                'Tipe Lengan':
                    item.sleeve_type === 'panjang' ? 'Panjang' : 'Pendek',
                'Status Administrasi':
                    STATUS_LABEL[item.admin_status] || item.admin_status,
                'Status Screening':
                    STATUS_LABEL[item.screening_status] ||
                    item.screening_status,
                'Tanggal Mendaftar': new Date(
                    item.created_at,
                ).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }),
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

                    const sizeMap: Record<string, number> = {};
                    dataset.forEach((r) => {
                        const sizeKey = `${r.shirt_size.toUpperCase()} ${r.sleeve_type === 'panjang' ? 'Panjang' : 'Pendek'}`;
                        sizeMap[sizeKey] = (sizeMap[sizeKey] || 0) + 1;
                    });

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

                    finalRows.push({}, {}, {});
                    finalRows.push({
                        'Nama Peserta': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    });
                    finalRows.push({
                        'Nama Peserta': '   RINCIAN ATRIBUT KAOS',
                        'Jenis Kelamin': 'JUMLAH',
                    });
                    finalRows.push({
                        'Nama Peserta': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    });

                    Object.keys(sizeMap)
                        .sort()
                        .forEach((sizeName) => {
                            finalRows.push({
                                'Nama Peserta': `  - Kaos ${sizeName}`,
                                'Jenis Kelamin': sizeMap[sizeName],
                            });
                        });
                    finalRows.push({
                        'Nama Peserta': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
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

                                if (
                                    C === 0 ||
                                    C === 2 ||
                                    C === 4 ||
                                    C === 5 ||
                                    C === 6 ||
                                    C === 7 ||
                                    C === 8
                                ) {
                                    cell.s.alignment.horizontal = 'center';
                                }
                            } else {
                                const cellValue = String(cell.v || '');
                                if (
                                    cellValue.includes('RINGKASAN') ||
                                    cellValue.includes('STATUS SELEKSI') ||
                                    cellValue.includes('RINCIAN ATRIBUT KAOS')
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
                        if (key === 'Ukuran Kaos') width = Math.max(width, 18);
                        if (key === 'Tipe Lengan') width = Math.max(width, 18);
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
                toast.success('Berhasil mengexport data Excel.');
            });
        } catch (err) {
            console.error(err);
            toast.error('Gagal mengexport data ke Excel.');
        }
    };

    return (
        <>
            <Head title="Seleksi Peserta" />

            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl leading-tight font-bold text-gray-900">
                            Seleksi Peserta
                        </h1>
                        <p className="mt-1 text-xs text-gray-400">
                            LATIN & LATPEL PC IPNU IPPNU Kabupaten Magetan 2026
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#1a4d2e] bg-[#1a4d2e] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1a4d2e]/90"
                        >
                            <FileDown className="h-3.5 w-3.5" />
                            Export Excel
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gray-200" />
                        <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                            Total Daftar
                        </span>
                        <span className="mt-1 block text-lg leading-none font-bold text-gray-800">
                            {data.length}
                        </span>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-amber-400" />
                        <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                            Adm. Pending
                        </span>
                        <span className="mt-1 block text-lg leading-none font-bold text-amber-600">
                            {adminPending}
                        </span>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
                        <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                            Adm. Lolos
                        </span>
                        <span className="mt-1 block text-lg leading-none font-bold text-emerald-600">
                            {adminLolos}
                        </span>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-red-500" />
                        <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                            Adm. Ditolak
                        </span>
                        <span className="mt-1 block text-lg leading-none font-bold text-red-600">
                            {adminDitolak}
                        </span>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
                        <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                            Scr. Lolos
                        </span>
                        <span className="mt-1 block text-lg leading-none font-bold text-emerald-600">
                            {screeningLolos}
                        </span>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-red-500" />
                        <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                            Scr. Ditolak
                        </span>
                        <span className="mt-1 block text-lg leading-none font-bold text-red-600">
                            {screeningDitolak}
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex w-fit rounded-lg bg-gray-100 p-0.5">
                    <button
                        onClick={() => setActiveTab('administrasi')}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all ${
                            activeTab === 'administrasi'
                                ? 'bg-white text-gray-800 shadow-xs'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <ClipboardList className="h-3.5 w-3.5" />
                        Seleksi Administrasi
                        {adminPending > 0 && (
                            <span className="inline-flex h-4 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[9px] font-bold text-amber-700">
                                {adminPending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('screening')}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all ${
                            activeTab === 'screening'
                                ? 'bg-white text-gray-800 shadow-xs'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Users className="h-3.5 w-3.5" />
                        Seleksi Screening
                        {screeningPending > 0 && (
                            <span className="inline-flex h-4 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[9px] font-bold text-blue-700">
                                {screeningPending}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'screening' && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-xs text-blue-700">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        Menampilkan peserta yang lolos{' '}
                        <strong className="mx-0.5">Seleksi Administrasi</strong>
                        . Total:{' '}
                        <strong className="ml-0.5">
                            {filteredData.length} peserta
                        </strong>
                        .
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    {filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                            <Users className="mb-2 h-8 w-8" />
                            <p className="text-xs">Belum ada data peserta.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70">
                                        {[
                                            '#',
                                            'Nama Peserta',
                                            'Jenis Kelamin',
                                            'Delegasi',
                                            'Kaos',
                                            'Tgl. Daftar',
                                            activeTab === 'administrasi'
                                                ? 'Status Adm.'
                                                : 'Status Scr.',
                                            'Aksi',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[10px] font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase last:text-center"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.map((reg, idx) => {
                                        const currentStatus =
                                            activeTab === 'administrasi'
                                                ? reg.admin_status
                                                : reg.screening_status;

                                        return (
                                            <tr
                                                key={reg.id}
                                                className="transition-colors hover:bg-gray-50/40"
                                            >
                                                <td className="px-4 py-3 text-xs text-gray-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        {(() => {
                                                            const fotoObj =
                                                                reg.files?.find(
                                                                    (f) =>
                                                                        f.field_key ===
                                                                        'fotoFormal',
                                                                );
                                                            const fotoUrl =
                                                                fotoObj?.r2_key
                                                                    ? fileUrl(
                                                                          fotoObj.r2_key,
                                                                      )
                                                                    : null;
                                                            return fotoUrl ? (
                                                                <img
                                                                    src={
                                                                        fotoUrl
                                                                    }
                                                                    alt=""
                                                                    className="animate-fade-in h-8 w-8 shrink-0 rounded-full border border-gray-100 bg-gray-50 object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[9px] font-bold text-gray-400 uppercase select-none">
                                                                    {reg.name.substring(
                                                                        0,
                                                                        2,
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                        <span>{reg.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {reg.gender}
                                                </td>
                                                <td className="max-w-[180px] truncate px-4 py-3 text-xs text-gray-500">
                                                    {reg.delegation}
                                                </td>
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
                                                    {reg.shirt_size} /{' '}
                                                    {reg.sleeve_type}
                                                </td>
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-400">
                                                    {new Date(
                                                        reg.created_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[currentStatus]}`}
                                                    >
                                                        {
                                                            STATUS_LABEL[
                                                                currentStatus
                                                            ]
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Link
                                                        href={`/registrasi/${reg.id}`}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

RegistrasiIndex.layout = {
    breadcrumbs: [{ title: 'Seleksi Peserta', href: '/registrasi' }],
};
