"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateTime } from "@/lib/utils";

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: unknown;
  createdAt: Date;
  user: { name: string; email: string; role: string } | null;
};

const ACTION_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "secondary",
  UPDATE: "outline",
  DELETE: "destructive",
  STATUS_CHANGE: "default",
};

export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  const [viewing, setViewing] = useState<AuditEntry | null>(null);

  const columns: ColumnDef<AuditEntry>[] = [
    { accessorKey: "createdAt", header: "When", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    {
      id: "user",
      header: "User",
      accessorFn: (row) => row.user?.name ?? "System",
      cell: ({ row }) => row.original.user?.name ?? "System",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge variant={ACTION_TONE[row.original.action] ?? "outline"}>{row.original.action}</Badge>
      ),
    },
    { accessorKey: "entity", header: "Entity" },
    { accessorKey: "entityId", header: "Entity ID", cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.entityId}</span>
    ) },
    {
      id: "details",
      header: "",
      cell: ({ row }) =>
        row.original.changes ? (
          <Button variant="ghost" size="sm" onClick={() => setViewing(row.original)}>
            View
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Log" description="System-wide record of every create, update, delete, and status change." />
      <DataTable columns={columns} data={entries} searchPlaceholder="Search audit log…" emptyMessage="No activity recorded yet." />
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewing?.action} — {viewing?.entity}
            </DialogTitle>
          </DialogHeader>
          <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
            {viewing ? JSON.stringify(viewing.changes, null, 2) : ""}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
