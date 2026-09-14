import { Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    ClipboardList,
    LayoutGrid,
    Settings,
    UserRound,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

const navigation = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Seleksi', href: '/registrasi', icon: ClipboardList },
    { title: 'Pengaturan', href: '/portal-settings', icon: Settings },
] as const;

export function MobileBottomNavigation() {
    const { auth } = usePage().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
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
                    'group flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition-colors',
                    active ? 'text-[#165c36]' : 'text-[#60758f]',
                    positionClass,
                )}
                aria-current={active ? 'page' : undefined}
            >
                <span className="flex h-7 min-w-10 items-center justify-center rounded-full px-2 transition-colors">
                    <item.icon
                        className="size-5"
                        strokeWidth={active ? 2.4 : 2}
                    />
                </span>
                <span className="max-w-full truncate">{item.title}</span>
            </Link>
        );
    };

    if (!auth.user) {
        return null;
    }

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_34px_rgba(22,92,54,0.12)] backdrop-blur-xl md:hidden"
            aria-label="Navigasi utama"
        >
            {navItem(navigation[0], 'col-start-1')}
            {navItem(navigation[1], 'col-start-2')}

            <Link
                href="/absensi"
                prefetch
                className="group col-start-3 flex min-w-0 flex-col items-center justify-end pb-1.5 text-[10px] font-semibold text-[#165c36]"
                aria-current={absensiActive ? 'page' : undefined}
            >
                <span
                    className={cn(
                        '-mt-7 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#28774c] to-[#12492b] text-white shadow-[0_10px_28px_rgba(22,92,54,0.34)] transition-transform active:scale-95',
                        absensiActive && 'scale-105',
                    )}
                >
                    <CalendarClock className="size-6" strokeWidth={2.4} />
                </span>
                <span className="mt-1">Absensi</span>
            </Link>

            {navItem(navigation[2], 'col-start-4')}

            <Link
                href="/settings/profile"
                prefetch
                className={cn(
                    'col-start-5 flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition-colors',
                    profileActive ? 'text-[#165c36]' : 'text-[#60758f]',
                )}
                aria-current={profileActive ? 'page' : undefined}
            >
                <span className="flex h-7 min-w-10 items-center justify-center rounded-full px-2 transition-colors">
                    <UserRound
                        className="size-5"
                        strokeWidth={profileActive ? 2.4 : 2}
                    />
                </span>
                <span>Profil</span>
            </Link>
        </nav>
    );
}
