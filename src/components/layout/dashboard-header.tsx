import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getNotificationsForUser } from "@/lib/services/notifications";

export async function DashboardHeader({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) {
  const { items, unreadCount } = await getNotificationsForUser(user.id);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1" />
      <NotificationBell
        initialItems={items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))}
        initialUnreadCount={unreadCount}
      />
      <UserMenu name={user.name} email={user.email} role={user.role} />
    </header>
  );
}
