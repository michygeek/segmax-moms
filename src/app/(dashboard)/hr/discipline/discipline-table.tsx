"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteDisciplineLogAction } from "@/app/(dashboard)/hr/discipline/actions";
import { DisciplineFormDialog } from "@/app/(dashboard)/hr/discipline/discipline-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type Employee = { id: string; fullName: string; employeeCode: string };

type DisciplineLogRow = {
  id: string;
  employeeId: string;
  type: string;
  description: string;
  actionTaken: string | null;
  date: Date;
  employee: { fullName: string; employeeCode: string };
};

export function DisciplineTable({
  logs,
  employees,
  canWrite,
}: {
  logs: DisciplineLogRow[];
  employees: Employee[];
  canWrite: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<DisciplineLogRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<DisciplineLogRow>[] = [
    {
      id: "employee",
      header: "Employee",
      accessorFn: (row) => row.employee.fullName,
      cell: ({ row }) => (
        <div>
          <p>{row.original.employee.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.original.employee.employeeCode}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <StatusBadge status={row.original.type} />,
    },
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "actionTaken",
      header: "Action Taken",
      cell: ({ row }) => row.original.actionTaken ?? "—",
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: DisciplineLogRow } }) => (
              <div className="flex justify-end gap-1">
                <DisciplineFormDialog
                  log={row.original}
                  employees={employees}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row.original)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteDisciplineLogAction(deleteTarget.id);
        toast.success("Discipline log deleted.");
      } catch {
        toast.error("Could not delete discipline log.");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Discipline Log"
        description="Disciplinary actions, warnings, and commendations."
        actions={
          canWrite ? (
            <DisciplineFormDialog
              employees={employees}
              trigger={
                <Button>
                  <Plus className="size-4" /> New Log Entry
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search discipline logs…"
        emptyMessage="No discipline logs yet."
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this log entry?"
        description="This discipline record will be permanently removed."
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
