import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    ClipboardList,
    Settings,
    Users,
    CalendarClock,
    X,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Seleksi Peserta',
        href: '/registrasi',
        icon: ClipboardList,
    },
    {
        title: 'Absensi Peserta',
        href: '/absensi',
        icon: CalendarClock,
    },
    {
        title: 'Pengaturan Portal',
        href: '/portal-settings',
        icon: Settings,
    },
    {
        title: 'Lihat Pendaftar (Publik)',
        href: '/pendaftar',
        icon: Users,
    },
];

export function AppSidebar() {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex items-center justify-between gap-2">
                    <SidebarMenu className="flex-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link
                                    href="/dashboard"
                                    prefetch
                                    onClick={() => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                    }}
                                >
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    {isMobile && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenMobile(false)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                            aria-label="Tutup menu sidebar"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
