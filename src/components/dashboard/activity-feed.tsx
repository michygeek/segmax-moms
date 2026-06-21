import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type ActivityItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userName: string;
  createdAt: Date;
};

const ACTION_VERB: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  STATUS_CHANGE: "changed the status of",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p>
                    <span className="font-medium">{item.userName}</span>{" "}
                    {ACTION_VERB[item.action] ?? item.action.toLowerCase()}{" "}
                    <span className="font-medium">{item.entity.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
