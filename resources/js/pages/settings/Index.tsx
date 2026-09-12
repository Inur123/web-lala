import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Settings as SettingsIcon,
    Power,
    Loader2,
    Calendar,
} from 'lucide-react';
import axios from 'axios';

export default function Settings({
    isOpen: initialIsOpen,
}: {
    isOpen: boolean;
}) {
    const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);
    const [saving, setSaving] = useState<boolean>(false);

    const handleToggle = async () => {
        setSaving(true);
        try {
            const targetState = !isOpen;
            const res = await axios.post('/portal-settings', {
                isOpen: targetState,
            });

            if (res.data.success) {
                setIsOpen(targetState);
                toast.success(res.data.message);
            }
        } catch (err: any) {
            toast.error(
                err.response?.data?.error ||
                    'Terjadi kesalahan saat menyimpan pengaturan.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Pengaturan Portal" />

            <div className="max-w-xl space-y-6 p-6">
                {/* Page Header */}
                <div>
                    <h1 className="flex items-center gap-2 text-xl leading-tight font-bold text-gray-900">
                        <SettingsIcon className="h-5 w-5 text-[#1a4d2e]" />{' '}
                        Pengaturan Portal
                    </h1>
                    <p className="mt-1 text-xs text-gray-400">
                        Atur status aktif formulir pendaftaran LATIN & LATPEL
                        Magetan 2026.
                    </p>
                </div>

                {/* Settings Card */}
                <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                                <Calendar className="h-4 w-4 text-gray-400" />{' '}
                                Status Pendaftaran Umum
                            </h3>
                            <p className="max-w-sm text-xs leading-relaxed text-gray-400">
                                Jika ditutup, calon peserta tidak dapat
                                mengakses formulir registrasi dan akan diarahkan
                                ke halaman pengumuman penutupan.
                            </p>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={handleToggle}
                            disabled={saving}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                isOpen ? 'bg-emerald-700' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    isOpen ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Live Status indicator */}
                    <div
                        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-xs font-semibold ${
                            isOpen
                                ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700'
                                : 'border-red-100 bg-red-50/50 text-red-600'
                        }`}
                    >
                        <Power className="h-4 w-4 shrink-0" />
                        <span>
                            {isOpen
                                ? 'Pendaftaran Sedang Dibuka. Calon peserta dapat mengirimkan data pendaftaran.'
                                : 'Pendaftaran Sedang Ditutup. Pengunjung umum tidak bisa mengakses form registrasi.'}
                        </span>
                        {saving && (
                            <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Settings.layout = {
    breadcrumbs: [{ title: 'Pengaturan Portal', href: '/portal-settings' }],
};
