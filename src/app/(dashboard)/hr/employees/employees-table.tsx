"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, UserX } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deactivateEmployeeAction } from "@/app/(dashboard)/hr/employees/actions";
import { EmployeeFormDialog } from "@/app/(dashboard)/hr/employees/employee-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";

type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  phone: string | null;
  hireDate: Date;
  isActive: boolean;
};

export function EmployeesTable({ employees, canWrite }: { employees: Employee[]; canWrite: boolean }) {
  const [deactivateTarget, setDeactivateTarget] = useState<Employee | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<Employee>[] = [
    { accessorKey: "employeeCode", header: "Code" },
    { accessorKey: "fullName", header: "Full Name" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "position", header: "Position" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    { accessorKey: "hireDate", header: "Hire Date", cell: ({ row }) => formatDate(row.original.hireDate) },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "secondary" : "outline"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Employee } }) => (
              <div className="flex justify-end gap-1">
                <EmployeeFormDialog
                  employee={row.original}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                {row.original.isActive && (
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeactivateTarget(row.original)}>
                    <UserX className="size-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  function handleDeactivate() {
    if (!deactivateTarget) return;
    startTransition(async () => {
      try {
        await deactivateEmployeeAction(deactivateTarget.id);
        toast.success("Employee deactivated.");
      } catch {
        toast.error("Could not deactivate employee.");
      } finally {
        setDeactivateTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employees"
        description="Manage employee master records."
        actions={
          canWrite ? (
            <EmployeeFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Employee
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={employees}
        searchPlaceholder="Search employees…"
        emptyMessage="No employees yet."
      />
      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate this employee?"
        description={`"${deactivateTarget?.fullName}" will be marked inactive. Existing records are kept.`}
        confirmLabel="Deactivate"
        loading={isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
