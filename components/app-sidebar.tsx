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
import { ShieldCheck, LayoutDashboard, X, ClipboardList, Settings } from "lucide-react";
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
  const isRegistrasiActive = pathname.startsWith("/registrasi");
  const isSettingsActive = pathname === "/settings";

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
        <SidebarMenu className="space-y-0.5">
          {/* Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpenMobile(false)}
              className={`w-full transition-all duration-200 ease-out cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isDashboardActive
                  ? "bg-[#1a4d2e]/10 text-[#1a4d2e] font-bold hover:bg-[#1a4d2e]/15 shadow-[inset_3px_0_0_0_#1a4d2e]"
                  : "text-gray-600 hover:bg-gray-100/60 hover:text-gray-900"
              }`}
              render={
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg">
                  <LayoutDashboard className={`size-4 transition-transform group-hover/button:scale-110 ${isDashboardActive ? "text-[#1a4d2e]" : "text-gray-400"}`} />
                  <span className="text-xs font-semibold">Dashboard</span>
                </Link>
              }
            />
          </SidebarMenuItem>

          {/* Registrasi & Seleksi */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpenMobile(false)}
              className={`w-full transition-all duration-200 ease-out cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isRegistrasiActive
                  ? "bg-[#1a4d2e]/10 text-[#1a4d2e] font-bold hover:bg-[#1a4d2e]/15 shadow-[inset_3px_0_0_0_#1a4d2e]"
                  : "text-gray-600 hover:bg-gray-100/60 hover:text-gray-900"
              }`}
              render={
                <Link href="/registrasi" className="flex items-center gap-2 px-3 py-2 rounded-lg">
                  <ClipboardList className={`size-4 transition-transform group-hover/button:scale-110 ${isRegistrasiActive ? "text-[#1a4d2e]" : "text-gray-400"}`} />
                  <span className="text-xs font-semibold">Registrasi</span>
                </Link>
              }
            />
          </SidebarMenuItem>

          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpenMobile(false)}
              className={`w-full transition-all duration-200 ease-out cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isSettingsActive
                  ? "bg-[#1a4d2e]/10 text-[#1a4d2e] font-bold hover:bg-[#1a4d2e]/15 shadow-[inset_3px_0_0_0_#1a4d2e]"
                  : "text-gray-600 hover:bg-gray-100/60 hover:text-gray-900"
              }`}
              render={
                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg">
                  <Settings className={`size-4 transition-transform group-hover/button:scale-110 ${isSettingsActive ? "text-[#1a4d2e]" : "text-gray-400"}`} />
                  <span className="text-xs font-semibold">Pengaturan</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
