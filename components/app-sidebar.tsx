"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ShieldCheck, LayoutDashboard, X } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userEmail: string;
  userName: string;
}

export function AppSidebar({ userEmail, userName, ...props }: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const userData = {
    name: userName,
    email: userEmail,
    avatar: "",
  };

  const isDashboardActive = pathname === "/dashboard";

  return (
    <Sidebar className="border-r border-gray-100" {...props}>
      <SidebarHeader className="h-16 border-b border-gray-100 flex items-center justify-between px-4 flex-row">
        <SidebarMenu className="flex-1">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex items-center gap-2 cursor-default select-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#1a4d2e] text-white">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight font-black">
                  <span className="truncate text-gray-800">LATIN-LATPEL</span>
                  <span className="truncate text-[9px] text-gray-400">ADMIN PORTAL</span>
                </div>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* X Close Button - Mobile Only */}
        <button
          onClick={() => setOpenMobile(false)}
          className="md:hidden flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer border-0 bg-transparent"
          aria-label="Tutup sidebar"
        >
          <X className="size-5" />
        </button>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={`w-full justify-start gap-3 px-3 py-5 rounded-xl transition-all cursor-pointer ${
                isDashboardActive
                  ? "bg-[#1a4d2e]/10 text-[#1a4d2e] font-bold hover:bg-[#1a4d2e]/15 hover:text-[#1a4d2e]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setOpenMobile(false)} // Auto-close sidebar on click (mobile)
            >
              <Link href="/dashboard" className="flex items-center gap-2 w-full">
                <LayoutDashboard className={`size-4 ${isDashboardActive ? "text-[#1a4d2e]" : "text-gray-400"}`} />
                <span className="text-xs uppercase tracking-wider font-semibold">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
