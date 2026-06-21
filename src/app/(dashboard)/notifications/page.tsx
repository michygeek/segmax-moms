import { Bell } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/auth";
import { getNotificationsForUser } from "@/lib/services/notifications";
import { formatDateTime } from "@/lib/utils";
import { redirect } from "next/navigation";

const TYPE_DOT: Record<string, string> = {
  INFO: "bg-blue-500",
  WARNING: "bg-amber-500",
  ERROR: "bg-destructive",
  SUCCESS: "bg-emerald-500",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { items } = await getNotificationsForUser(session.user.id);

  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" description="Recent alerts and system events for your account." />
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground">
              <Bell className="size-8" />
              <p>You&apos;re all caught up — no notifications yet.</p>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex gap-3 border-b px-4 py-3 last:border-b-0 ${
                    item.isRead ? "" : "bg-accent/30"
                  }`}
                >
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${TYPE_DOT[item.type]}`} />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
