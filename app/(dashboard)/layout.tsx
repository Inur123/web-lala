import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardToastHandler } from "@/components/dashboard-toast";

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session.user;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardToastHandler />
      <AppSidebar
        userEmail={user.email}
        userName={user.name || "Super Admin"}
      />
      <div className="flex h-screen flex-1 flex-col overflow-hidden bg-white">
        {/* Sticky top header with sidebar trigger */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-4">
          <SidebarTrigger className="-ml-1 text-gray-500 md:hidden" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 bg-gray-100 md:hidden"
          />
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
