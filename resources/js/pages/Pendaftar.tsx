import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Search,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLogoIcon from '@/components/app-logo-icon';
import axios from 'axios';

type RegistrantPublic = {
    id: string;
    name: string;
    gender: string;
    delegation: string;
    adminStatus: 'pending' | 'lolos' | 'ditolak';
    screeningStatus: 'pending' | 'lolos' | 'ditolak';
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
        className: 'border-red-200 bg-red-50 text-red-600',
    },
};

export default function Pendaftar() {
    const [data, setData] = useState<RegistrantPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get('/api/public/registrants');
            setData(res.data.registrants || []);
        } catch (error) {
            console.error('Error fetching registrants:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const filteredData = data.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.delegation.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Data Pendaftar - LATIN & LATPEL 2026" />

            <div className="container mx-auto max-w-5xl px-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href="/"
                            className="mb-6 inline-flex items-center text-sm font-bold text-gray-500 transition-colors hover:text-[#1a4d2e]"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Kembali ke
                            Beranda
                        </Link>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <AppLogoIcon className="h-6 w-6 text-[#1a4d2e]" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 md:text-2xl">
                                    Data Pendaftar
                                </h1>
                                <p className="mt-0.5 text-xs font-medium text-gray-500">
                                    Total:{' '}
                                    <strong className="text-[#1a4d2e]">
                                        {data.length}
                                    </strong>{' '}
                                    Calon Peserta
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari nama atau delegasi..."
                                className="h-11 rounded-xl border-gray-200 bg-white pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#1a4d2e] disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCw className="h-8 w-8 animate-spin text-[#1a4d2e]" />
                            <p className="mt-4 text-sm font-semibold text-gray-500">
                                Memuat data pendaftar...
                            </p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                                <Users className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">
                                Pendaftar tidak ditemukan
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Belum ada data atau kata kunci tidak cocok.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/80">
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase">
                                            Peserta
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase">
                                            Delegasi
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase">
                                            Administrasi
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase">
                                            Screening
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.map((reg) => {
                                        const AdminIcon =
                                            STATUS_CONFIG[reg.adminStatus].icon;
                                        const ScreenIcon =
                                            STATUS_CONFIG[reg.screeningStatus]
                                                .icon;

                                        return (
                                            <tr
                                                key={reg.id}
                                                className="transition-colors hover:bg-gray-50/50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        {reg.photoUrl ? (
                                                            <img
                                                                src={
                                                                    reg.photoUrl
                                                                }
                                                                alt=""
                                                                className="h-10 w-10 shrink-0 rounded-full border border-gray-100 bg-gray-50 object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xs font-bold text-gray-400">
                                                                {reg.name
                                                                    .substring(
                                                                        0,
                                                                        2,
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {reg.name}
                                                            </p>
                                                            <p className="text-[11px] font-medium text-gray-500">
                                                                {reg.gender ===
                                                                    'Laki-laki' ||
                                                                reg.gender ===
                                                                    'l'
                                                                    ? 'Laki-laki (IPNU)'
                                                                    : 'Perempuan (IPPNU)'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                        {reg.delegation}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[reg.adminStatus].className}`}
                                                    >
                                                        <AdminIcon className="mr-1 h-3 w-3" />
                                                        {
                                                            STATUS_CONFIG[
                                                                reg.adminStatus
                                                            ].label
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[reg.screeningStatus].className}`}
                                                    >
                                                        <ScreenIcon className="mr-1 h-3 w-3" />
                                                        {
                                                            STATUS_CONFIG[
                                                                reg
                                                                    .screeningStatus
                                                            ].label
                                                        }
                                                    </Badge>
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
        </div>
    );
}
