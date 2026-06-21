"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { HardHat, Plus } from "lucide-react";

import { PpeCheckinFormDialog } from "@/app/(dashboard)/safety/ppe-checkins/ppe-checkin-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";

type Employee = { id: string; fullName: string };

type CheckinRow = {
  id: string;
  checkDate: Date;
  compliant: boolean;
  employee: { fullName: string };
  checkedBy: { name: string };
};

export function PpeCheckinsTable({
  checkins,
  employees,
  canWrite,
}: {
  checkins: CheckinRow[];
  employees: Employee[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<CheckinRow>[] = [
    {
      id: "employee",
      header: "Employee",
      accessorFn: (row) => row.employee.fullName,
    },
    {
      accessorKey: "checkDate",
      header: "Check Date",
      cell: ({ row }) => formatDate(row.original.checkDate),
    },
    {
      accessorKey: "compliant",
      header: "Compliant",
      cell: ({ row }) => (
        <Badge variant={row.original.compliant ? "secondary" : "outline"}>
          {row.original.compliant ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      id: "checkedBy",
      header: "Checked By",
      accessorFn: (row) => row.checkedBy.name,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="PPE Check-in"
        description="Daily pre-shift PPE compliance checks."
        actions={
          canWrite ? (
            <PpeCheckinFormDialog
              employees={employees}
              trigger={
                <Button>
                  <Plus className="size-4" /> New Check-in
                </Button>
              }
            />
          ) : undefined
        }
      />
      {checkins.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No PPE check-ins yet"
          description="Record the first pre-shift PPE compliance check."
        />
      ) : (
        <DataTable
          columns={columns}
          data={checkins}
          searchPlaceholder="Search check-ins…"
          emptyMessage="No PPE check-ins yet."
        />
      )}
    </div>
  );
}
