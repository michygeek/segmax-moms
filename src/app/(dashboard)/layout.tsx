import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { visibleModules } from "@/lib/permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const modules = visibleModules(session.user.role);

  return (
    <SidebarProvider>
      <AppSidebar visibleModules={modules} />
      <SidebarInset>
        <DashboardHeader
          user={{
            id: session.user.id,
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            role: session.user.role,
          }}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
