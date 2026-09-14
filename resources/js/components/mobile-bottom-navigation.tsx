import { Link, router, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    ClipboardList,
    LayoutGrid,
    LogOut,
    Settings,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { UserInfo } from '@/components/user-info';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';

const navigation = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Seleksi', href: '/registrasi', icon: ClipboardList },
    { title: 'Pengaturan', href: '/portal-settings', icon: Settings },
] as const;

export function MobileBottomNavigation() {
    const { auth } = usePage().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const [profileOpen, setProfileOpen] = useState(false);
    const absensiActive = isCurrentOrParentUrl('/absensi');
    const profileActive = isCurrentOrParentUrl('/settings');

    const navItem = (
        item: (typeof navigation)[number],
        positionClass: string,
    ) => {
        const active = isCurrentOrParentUrl(item.href);

        return (
            <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                    'flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors',
                    active ? 'text-[#1a4d2e]' : 'text-slate-500',
                    positionClass,
                )}
                aria-current={active ? 'page' : undefined}
            >
                <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                <span className="max-w-full truncate">{item.title}</span>
            </Link>
        );
    };

    if (!auth.user) {
        return null;
    }

    return (
        <>
            <nav
                className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
                aria-label="Navigasi utama"
            >
                {navItem(navigation[0], 'col-start-1')}
                {navItem(navigation[1], 'col-start-2')}

                <Link
                    href="/absensi"
                    prefetch
                    className="group col-start-3 flex min-w-0 flex-col items-center justify-end pb-2 text-[10px] font-semibold text-[#1a4d2e]"
                    aria-current={absensiActive ? 'page' : undefined}
                >
                    <span
                        className={cn(
                            '-mt-7 flex size-14 items-center justify-center rounded-full border-[5px] border-[#f6f8f6] bg-[#1a4d2e] text-white shadow-[0_8px_24px_rgba(26,77,46,0.32)] transition-transform active:scale-95',
                            absensiActive && 'ring-3 ring-emerald-200',
                        )}
                    >
                        <CalendarClock className="size-6" strokeWidth={2.4} />
                    </span>
                    <span className="mt-1">Absensi</span>
                </Link>

                {navItem(navigation[2], 'col-start-4')}

                <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className={cn(
                        'col-start-5 flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors',
                        profileActive || profileOpen
                            ? 'text-[#1a4d2e]'
                            : 'text-slate-500',
                    )}
                    aria-label="Buka profil"
                    aria-expanded={profileOpen}
                >
                    <UserRound
                        className="size-5"
                        strokeWidth={profileActive || profileOpen ? 2.4 : 2}
                    />
                    <span>Profil</span>
                </button>
            </nav>

            <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                <SheetContent
                    side="bottom"
                    className="gap-0 rounded-t-[1.75rem] border-x-0 border-b-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
                >
                    <div
                        className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300"
                        aria-hidden="true"
                    />
                    <SheetHeader className="px-1 pt-0 text-left">
                        <SheetTitle>Profil administrator</SheetTitle>
                        <SheetDescription>
                            Kelola akun atau akhiri sesi Anda.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-3 rounded-2xl border bg-slate-50 p-4">
                        <UserInfo user={auth.user} showEmail />
                    </div>

                    <div className="mt-4 grid gap-2">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="h-12 justify-start rounded-xl px-4"
                                asChild
                            >
                                <Link href="/settings/profile">
                                    <Settings className="mr-3 size-5" />
                                    Pengaturan Akun
                                </Link>
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                className="h-12 justify-start rounded-xl px-4 text-red-600 hover:bg-red-50 hover:text-red-700"
                                asChild
                            >
                                <Link
                                    href={logout()}
                                    as="button"
                                    onClick={() => router.flushAll()}
                                    data-test="mobile-logout-button"
                                >
                                    <LogOut className="mr-3 size-5" />
                                    Keluar
                                </Link>
                            </Button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
