import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile, state } = useSidebar();
    const isCollapsed = state === 'collapsed' && !isMobile;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = Boolean(
                        item.items && item.items.length > 0,
                    );
                    const isChildActive = Boolean(
                        item.items?.some((sub) => isCurrentUrl(sub.href)),
                    );

                    // Dropdown/Accordion item with nested sub-items
                    if (hasSubItems && item.items) {
                        // Jika sidebar dalam mode icon collapsed (desktop icon only)
                        if (isCollapsed) {
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuButton
                                                isActive={isChildActive}
                                                tooltip={{
                                                    children: item.title,
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side="right"
                                            align="start"
                                            sideOffset={8}
                                            className="min-w-48 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
                                        >
                                            <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                                                {item.icon && (
                                                    <item.icon className="size-3.5" />
                                                )}
                                                <span>{item.title}</span>
                                            </div>
                                            <div className="mt-1 flex flex-col gap-0.5">
                                                {item.items.map((subItem) => {
                                                    const active = isCurrentUrl(
                                                        subItem.href,
                                                    );
                                                    return (
                                                        <DropdownMenuItem
                                                            key={subItem.title}
                                                            asChild
                                                            className="cursor-pointer"
                                                        >
                                                            <Link
                                                                href={
                                                                    subItem.href
                                                                }
                                                                prefetch
                                                                className={cn(
                                                                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                                                                    active
                                                                        ? 'bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                                                                )}
                                                            >
                                                                {subItem.icon && (
                                                                    <subItem.icon className="text-muted-foreground size-4 shrink-0" />
                                                                )}
                                                                <span>
                                                                    {
                                                                        subItem.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            );
                        }

                        // Jika sidebar dalam mode expanded (normal)
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isChildActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            isActive={isChildActive}
                                            className="cursor-pointer"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="py-1">
                                            {item.items.map((subItem) => {
                                                const active = isCurrentUrl(
                                                    subItem.href,
                                                );
                                                return (
                                                    <SidebarMenuSubItem
                                                        key={subItem.title}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={active}
                                                        >
                                                            <Link
                                                                href={
                                                                    subItem.href
                                                                }
                                                                prefetch
                                                                onClick={() => {
                                                                    if (
                                                                        isMobile
                                                                    ) {
                                                                        setOpenMobile(
                                                                            false,
                                                                        );
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    'flex items-center gap-2 rounded-md transition-colors',
                                                                    active &&
                                                                        'font-medium text-emerald-700 dark:text-emerald-400',
                                                                )}
                                                            >
                                                                {subItem.icon && (
                                                                    <subItem.icon className="size-3.5 shrink-0" />
                                                                )}
                                                                <span>
                                                                    {
                                                                        subItem.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    // Single menu item
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={
                                    item.href ? isCurrentUrl(item.href) : false
                                }
                                tooltip={{ children: item.title }}
                            >
                                <Link
                                    href={item.href ?? '#'}
                                    prefetch
                                    onClick={() => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                    }}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
