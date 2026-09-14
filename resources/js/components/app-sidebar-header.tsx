import { Breadcrumbs } from '@/components/breadcrumbs';
import AppLogoIcon from '@/components/app-logo-icon';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="border-sidebar-border/50 sticky top-0 z-30 flex h-14 shrink-0 items-center border-b bg-gradient-to-r from-[#edf8f1]/95 via-white/95 to-[#f4f7ff]/95 px-4 backdrop-blur-xl md:static md:h-16 md:bg-transparent md:bg-none md:px-4 md:backdrop-blur-none md:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="hidden items-center gap-2 md:flex">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex min-w-0 items-center gap-3 md:hidden">
                <AppLogoIcon className="size-9 shrink-0 rounded-lg bg-white object-contain" />
                <div className="min-w-0 leading-tight">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1a4d2e] uppercase">
                        Admin LATIN LATPEL
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {breadcrumbs.at(-1)?.title ?? 'Dashboard'}
                    </p>
                </div>
            </div>
        </header>
    );
}
