import { Link } from '@inertiajs/react';
import { BadgeCheck, Check, ChevronDown, UserCheck, Users } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const isPesertaActive = isCurrentOrParentUrl('/peserta');
    const isAdminActive = isCurrentUrl('/peserta/administrasi');
    const isScreeningActive = isCurrentUrl('/peserta/screening');

    return (
        <header className="border-sidebar-border/50 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-gradient-to-r from-[#edf8f1]/95 via-white/95 to-[#f4f7ff]/95 px-4 backdrop-blur-xl md:static md:h-16 md:bg-transparent md:bg-none md:px-4 md:backdrop-blur-none md:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="hidden items-center gap-2 md:flex">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex min-w-0 items-center gap-3 md:hidden">
                <AppLogoIcon className="size-9 shrink-0 object-contain" />
                <div className="min-w-0 leading-tight">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1a4d2e] uppercase">
                        Admin LATIN LATPEL
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {breadcrumbs.at(-1)?.title ?? 'Dashboard'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-8 gap-1.5 px-2.5 text-xs font-semibold shadow-2xs transition-colors',
                                isPesertaActive
                                    ? 'border-[#1a4d2e] bg-[#1a4d2e] text-white hover:bg-[#123620] hover:text-white'
                                    : 'border-emerald-200 bg-white/90 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300',
                            )}
                        >
                            <Users
                                className={cn(
                                    'size-3.5',
                                    isPesertaActive
                                        ? 'text-white'
                                        : 'text-emerald-700 dark:text-emerald-400',
                                )}
                            />
                            <span>Peserta</span>
                            <ChevronDown
                                className={cn(
                                    'size-3 opacity-75',
                                    isPesertaActive
                                        ? 'text-white'
                                        : 'text-muted-foreground',
                                )}
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
                    >
                        <div className="border-b border-slate-100 px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                            Menu Peserta
                        </div>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                                href="/peserta/administrasi"
                                prefetch
                                className={cn(
                                    'mt-1 flex items-center gap-2.5 rounded-lg py-2',
                                    isAdminActive &&
                                        'bg-emerald-50 dark:bg-emerald-950/60',
                                )}
                            >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    <UserCheck className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                        Administrasi
                                    </p>
                                    <p className="text-muted-foreground truncate text-[10px]">
                                        Peserta lolos administrasi
                                    </p>
                                </div>
                                {isAdminActive && (
                                    <Check className="size-3.5 shrink-0 text-emerald-700" />
                                )}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                                href="/peserta/screening"
                                prefetch
                                className={cn(
                                    'flex items-center gap-2.5 rounded-lg py-2',
                                    isScreeningActive &&
                                        'bg-emerald-50 dark:bg-emerald-950/60',
                                )}
                            >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#1a4d2e] text-white shadow-2xs">
                                    <BadgeCheck className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                        Screening
                                    </p>
                                    <p className="text-muted-foreground truncate text-[10px]">
                                        Peserta lolos screening
                                    </p>
                                </div>
                                {isScreeningActive && (
                                    <Check className="size-3.5 shrink-0 text-emerald-700" />
                                )}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
