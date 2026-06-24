"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

const TYPE_DOT: Record<NotificationItem["type"], string> = {
  INFO: "bg-blue-500",
  WARNING: "bg-amber-500",
  ERROR: "bg-destructive",
  SUCCESS: "bg-emerald-500",
};

export function NotificationBell({
  initialItems,
  initialUnreadCount,
}: {
  initialItems: NotificationItem[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items);
        setUnreadCount(data.unreadCount);
      } catch {
        // ignore transient polling failures
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleOpenItem(item: NotificationItem) {
    if (!item.isRead) {
      try {
        const res = await fetch(`/api/notifications/${item.id}/read`, { method: "POST" });
        if (res.ok) {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
          setUnreadCount((c) => Math.max(0, c - 1));
        }
      } catch {
        // ignore transient network failure — next poll will resync state
      }
    }
    if (item.link) router.push(item.link);
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // ignore transient network failure — next poll will resync state
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          </DropdownMenuGroup>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {items.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className={`flex w-full gap-2 border-b px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-accent ${
                  item.isRead ? "" : "bg-accent/40"
                }`}
              >
                <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${TYPE_DOT[item.type]}`} />
                <span className="flex-1 space-y-0.5">
                  <span className="block font-medium">{item.title}</span>
                  <span className="block text-muted-foreground">{item.message}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </span>
                </span>
              </button>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <Link
          href="/notifications"
          className="block px-3 py-2 text-center text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
