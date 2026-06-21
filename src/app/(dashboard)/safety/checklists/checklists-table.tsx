"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Plus } from "lucide-react";

import { ChecklistFormDialog } from "@/app/(dashboard)/safety/checklists/checklist-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type ChecklistRow = {
  id: string;
  date: Date;
  shift: string | null;
  status: string;
  checkedBy: { name: string };
};

export function ChecklistsTable({
  checklists,
  canWrite,
}: {
  checklists: ChecklistRow[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<ChecklistRow>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "shift", header: "Shift", cell: ({ row }) => row.original.shift ?? "—" },
    {
      id: "checkedBy",
      header: "Checked By",
      accessorFn: (row) => row.checkedBy.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Daily Safety Checklists"
        description="Pre-shift facility safety walkthrough records."
        actions={
          canWrite ? (
            <ChecklistFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Checklist
                </Button>
              }
            />
          ) : undefined
        }
      />
      {checklists.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No checklists yet"
          description="Submit the first daily safety checklist to get started."
        />
      ) : (
        <DataTable
          columns={columns}
          data={checklists}
          searchPlaceholder="Search checklists…"
          emptyMessage="No checklists yet."
        />
      )}
    </div>
  );
}
