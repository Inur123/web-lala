import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-magetan-2026";

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
      id: string;
      email: string;
      name?: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

export default async function Page() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email} userName={user.name || "Super Admin"} />
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Original shadcn sidebar-02 fixed header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-4">
          <SidebarTrigger className="-ml-1 text-gray-500 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-100 md:hidden" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" className="text-gray-500 hover:text-gray-900">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block text-gray-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 font-medium">Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Polos Putih Bersih (Original shadcn bg-white) */}
        <div className="flex flex-1 flex-col gap-4 p-4 bg-white" />
      </div>
    </SidebarProvider>
  );
}
