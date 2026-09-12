import { Head, Link } from '@inertiajs/react';

interface ErrorProps {
    status: number;
}

export default function ErrorPage({ status }: ErrorProps) {
    const title =
        {
            503: 'Layanan tidak tersedia',
            500: 'Terjadi kesalahan',
            404: 'Halaman tidak ditemukan',
            403: 'Akses ditolak',
            401: 'Anda belum masuk',
            429: 'Terlalu banyak permintaan',
            419: 'Sesi telah berakhir',
        }[status] || 'Terjadi kesalahan';

    const description =
        {
            503: 'Layanan sedang dalam pemeliharaan atau sementara tidak dapat digunakan.',
            500: 'Sistem sedang mengalami kendala. Silakan coba kembali beberapa saat lagi.',
            404: 'Halaman yang Anda cari tidak tersedia, telah dipindahkan, atau sudah dihapus.',
            403: 'Anda tidak memiliki izin untuk membuka halaman ini.',
            401: 'Silakan masuk terlebih dahulu untuk mengakses halaman ini.',
            429: 'Permintaan dilakukan terlalu cepat. Tunggu sebentar sebelum mencoba kembali.',
            419: 'Sesi Anda sudah kedaluwarsa. Silakan kembali dan coba lagi.',
        }[status] || 'Permintaan Anda belum dapat diproses. Silakan coba kembali.';

    const requiresLogin = [401, 403].includes(status);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center font-['Manrope',ui-sans-serif,system-ui,sans-serif] text-slate-900">
            <Head title={`${status} - ${title}`} />
            
            <img 
                src="/images/logo-lala.png" 
                alt="Logo" 
                className="mb-6 h-auto w-24 object-contain"
            />
            
            <div className="mb-6 text-[4.5rem] font-extrabold leading-none tracking-tight text-[#1a4d2e] sm:text-[6rem]">
                {status}
            </div>
            
            <h1 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">
                {title}
            </h1>
            
            <p className="mb-8 max-w-[32rem] text-sm leading-relaxed text-slate-500">
                {description}
            </p>
            
            <Link
                href={requiresLogin ? '/login' : '/'}
                className="inline-flex items-center justify-center rounded-lg bg-[#1a4d2e] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#143d24] focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:ring-offset-2"
            >
                {requiresLogin ? 'Kembali ke halaman masuk' : 'Kembali ke beranda'}
            </Link>
        </main>
    );
}
