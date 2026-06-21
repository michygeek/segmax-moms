"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteShiftAction } from "@/app/(dashboard)/hr/shifts/actions";
import { ShiftAssignmentFormDialog } from "@/app/(dashboard)/hr/shifts/shift-assignment-form-dialog";
import { ShiftFormDialog } from "@/app/(dashboard)/hr/shifts/shift-form-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";

type Employee = { id: string; fullName: string; employeeCode: string };
type Shift = { id: string; name: string; startTime: string; endTime: string };
type ShiftAssignmentRow = {
  id: string;
  date: Date;
  employee: { fullName: string; employeeCode: string };
  shift: { name: string; startTime: string; endTime: string };
};

export function ShiftsClient({
  shifts,
  assignments,
  employees,
  canWrite,
}: {
  shifts: Shift[];
  assignments: ShiftAssignmentRow[];
  employees: Employee[];
  canWrite: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [isPending, startTransition] = useTransition();

  const shiftColumns: ColumnDef<Shift>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "startTime", header: "Start Time" },
    { accessorKey: "endTime", header: "End Time" },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Shift } }) => (
              <div className="flex justify-end gap-1">
                <ShiftFormDialog
                  shift={row.original}
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

  const assignmentColumns: ColumnDef<ShiftAssignmentRow>[] = [
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
      id: "shift",
      header: "Shift",
      accessorFn: (row) => row.shift.name,
      cell: ({ row }) => `${row.original.shift.name} (${row.original.shift.startTime}–${row.original.shift.endTime})`,
    },
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
  ];

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteShiftAction(deleteTarget.id);
        toast.success("Shift deleted.");
      } catch {
        toast.error("Could not delete shift. It may have existing assignments.");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Shifts" description="Manage shift definitions and employee shift assignments." />
      <Tabs defaultValue="shifts">
        <TabsList>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="shifts" className="space-y-3 pt-4">
          {canWrite && (
            <div className="flex justify-end">
              <ShiftFormDialog
                trigger={
                  <Button>
                    <Plus className="size-4" /> New Shift
                  </Button>
                }
              />
            </div>
          )}
          <DataTable
            columns={shiftColumns}
            data={shifts}
            searchPlaceholder="Search shifts…"
            emptyMessage="No shifts defined yet."
          />
        </TabsContent>
        <TabsContent value="assignments" className="space-y-3 pt-4">
          {canWrite && (
            <div className="flex justify-end">
              <ShiftAssignmentFormDialog
                employees={employees}
                shifts={shifts}
                trigger={
                  <Button>
                    <Plus className="size-4" /> New Assignment
                  </Button>
                }
              />
            </div>
          )}
          <DataTable
            columns={assignmentColumns}
            data={assignments}
            searchPlaceholder="Search assignments…"
            emptyMessage="No shift assignments yet."
          />
        </TabsContent>
      </Tabs>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this shift?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
