"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Lock, Plus } from "lucide-react";

import { LotoActions } from "@/app/(dashboard)/safety/lotos/loto-actions";
import { LotoFormDialog } from "@/app/(dashboard)/safety/lotos/loto-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";

type LotoRow = {
  id: string;
  equipment: string;
  reason: string;
  status: string;
  lockedAt: Date;
  unlockedAt: Date | null;
  lockedBy: { name: string };
  unlockedBy: { name: string } | null;
};

export function LotosTable({ lotos, canWrite }: { lotos: LotoRow[]; canWrite: boolean }) {
  const columns: ColumnDef<LotoRow>[] = [
    { accessorKey: "equipment", header: "Equipment" },
    { accessorKey: "reason", header: "Reason" },
    {
      id: "lockedBy",
      header: "Locked By",
      accessorFn: (row) => row.lockedBy.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "lockedAt",
      header: "Locked At",
      cell: ({ row }) => formatDateTime(row.original.lockedAt),
    },
    {
      accessorKey: "unlockedAt",
      header: "Unlocked At",
      cell: ({ row }) => formatDateTime(row.original.unlockedAt),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: LotoRow } }) => (
              <LotoActions lotoId={row.original.id} status={row.original.status} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lock Out / Tag Out"
        description="Equipment lockout/tagout records for safe maintenance."
        actions={
          canWrite ? (
            <LotoFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Lockout
                </Button>
              }
            />
          ) : undefined
        }
      />
      {lotos.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No lockout records yet"
          description="Create the first equipment lockout record."
        />
      ) : (
        <DataTable
          columns={columns}
          data={lotos}
          searchPlaceholder="Search lockouts…"
          emptyMessage="No lockout records yet."
        />
      )}
    </div>
  );
}
