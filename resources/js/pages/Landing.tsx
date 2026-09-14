import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Mail,
    MapPin,
    Phone,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const quickFacts = [
    {
        icon: CalendarDays,
        label: 'Tanggal kegiatan',
        value: '24-27 Desember 2026',
    },
    {
        icon: MapPin,
        label: 'Lokasi / venue',
        value: 'Pondok Pesantren Roudlotul Huda, Kedungpanji, Lembeyan',
    },
    { icon: Users, label: 'Target peserta', value: '25 Orang' },
];

export default function Landing() {
    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <Head title="LATIN & LATPEL 2026 - IPNU IPPNU Magetan" />

            <header className="bg-background/95 border-b backdrop-blur-xl">
                <div className="mx-auto flex h-18 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <AppLogoIcon
                        src="/images/logo-lala-2.webp"
                        alt="LATIN LATPEL PC IPNU IPPNU Magetan"
                        className="h-auto w-24 sm:w-44"
                    />
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-xs sm:px-3 sm:text-sm"
                            asChild
                        >
                            <Link href="/pendaftar">Daftar Peserta</Link>
                        </Button>
                        <Button
                            size="sm"
                            className="bg-[#1a4d2e] px-2 text-xs hover:bg-[#123620] sm:px-3 sm:text-sm"
                            asChild
                        >
                            <Link href="/register">
                                Daftar <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative flex flex-1 items-center overflow-hidden py-14 sm:py-20 lg:py-24">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#ecfdf5_0,_transparent_45%)]" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb35_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb35_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_90%)] bg-[size:56px_56px]" />

                <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <section className="mx-auto max-w-6xl text-center">
                        <Badge
                            variant="outline"
                            className="bg-background/80 text-[#1a4d2e]"
                        >
                            <span className="size-2 rounded-full bg-[#10b981]" />
                            Registrasi calon instruktur &amp; pelatih
                        </Badge>

                        <h1 className="mx-auto mt-8 max-w-6xl text-5xl leading-[1.05] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-8xl">
                            Latihan Instruktur &amp;
                            <span className="mt-2 block text-[#10b981]">
                                Latihan Pelatih 2026
                            </span>
                        </h1>

                        <p className="text-muted-foreground mx-auto mt-7 max-w-3xl text-base leading-7 sm:text-lg">
                            Episentrum Kaderisasi: Orkestrasi Gerakan Inklusif,
                            Wujudkan Instruktur-Pelatih yang
                            Solutif-Transformatif.
                        </p>

                        <Button
                            size="lg"
                            className="mt-9 min-w-52 bg-[#1a4d2e] hover:bg-[#123620]"
                            asChild
                        >
                            <Link href="/register">
                                Daftar sekarang <ArrowRight />
                            </Link>
                        </Button>
                    </section>

                    <Card className="bg-background/90 mx-auto mt-16 max-w-6xl py-0 shadow-sm sm:mt-20">
                        <CardContent className="grid p-0 md:grid-cols-3">
                            {quickFacts.map((item, index) => (
                                <div
                                    key={item.label}
                                    className="relative flex items-center gap-4 px-6 py-5 sm:px-8"
                                >
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d1fae5] text-[#1a4d2e]">
                                        <item.icon className="size-5" />
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <p className="text-muted-foreground text-sm">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {item.value}
                                        </p>
                                    </div>
                                    {index < quickFacts.length - 1 ? (
                                        <Separator
                                            orientation="vertical"
                                            className="absolute top-1/2 right-0 hidden h-12 -translate-y-1/2 md:block"
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="bg-[#0d3522] py-7 text-green-50">
                <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="flex max-w-xl items-center gap-4">
                            <AppLogoIcon
                                src="/images/logo-putih.webp"
                                alt="Logo LATIN LATPEL"
                                className="h-auto w-28 shrink-0 sm:w-32"
                            />
                            <p className="max-w-sm text-xs leading-5 text-green-100/70">
                                Latihan Instruktur dan Latihan Pelatih PC IPNU
                                IPPNU Kabupaten Magetan 2026.
                            </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-green-100/70 hover:bg-white/10 hover:text-white"
                                asChild
                            >
                                <a href="mailto:pelajarnumagetan@gmail.com">
                                    <Mail className="size-4 text-[#34d399]" />
                                    pelajarnumagetan@gmail.com
                                </a>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-green-100/70 hover:bg-white/10 hover:text-white"
                                asChild
                            >
                                <a href="tel:+6285708837146">
                                    <Phone className="size-4 text-[#34d399]" />
                                    belum diseting
                                </a>
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-5 bg-white/10" />
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-green-100/50">
                            © 2026 PC IPNU IPPNU Kabupaten Magetan
                        </p>
                        <Link
                            href="/login"
                            className="text-xs font-medium text-green-100/50 transition-colors hover:text-green-100"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
