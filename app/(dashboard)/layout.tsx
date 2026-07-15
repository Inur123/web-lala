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
    <SidebarProvider className="h-screen w-full overflow-hidden select-none touch-none overscroll-none">
      <DashboardToastHandler />
      <AppSidebar
        userEmail={user.email}
        userName={user.name || "Super Admin"}
      />
      <div className="flex h-screen flex-1 flex-col overflow-hidden bg-white min-w-0 relative overscroll-y-none">
        {/* Fixed top header with sidebar trigger */}
        <header className="h-16 border-b border-gray-100 bg-white px-4 flex items-center shrink-0 w-full select-none touch-none pointer-events-auto">
          <SidebarTrigger className="-ml-1 text-gray-500 md:hidden" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 bg-gray-100 md:hidden"
          />
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
