"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { PpeFormDialog } from "@/app/(dashboard)/hr/ppe/ppe-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";

type Employee = { id: string; fullName: string; employeeCode: string };

type PpeItem = { item: string; compliant: boolean };

type PpeRecordRow = {
  id: string;
  checkDate: Date;
  items: unknown;
  compliant: boolean;
  employee: { fullName: string; employeeCode: string };
  checkedBy: { name: string };
};

function asItems(items: unknown): PpeItem[] {
  if (!Array.isArray(items)) return [];
  return items as PpeItem[];
}

export function PpeTable({
  records,
  employees,
  canWrite,
}: {
  records: PpeRecordRow[];
  employees: Employee[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<PpeRecordRow>[] = [
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
    { accessorKey: "checkDate", header: "Check Date", cell: ({ row }) => formatDate(row.original.checkDate) },
    {
      id: "items",
      header: "Items Checked",
      cell: ({ row }) => {
        const items = asItems(row.original.items);
        return (
          <div className="flex flex-wrap gap-1">
            {items.map((i, idx) => (
              <Badge key={idx} variant={i.compliant ? "secondary" : "destructive"}>
                {i.item}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "compliant",
      header: "Overall",
      cell: ({ row }) => (
        <Badge variant={row.original.compliant ? "secondary" : "destructive"}>
          {row.original.compliant ? "Compliant" : "Non-Compliant"}
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
        title="PPE Compliance"
        description="Personal protective equipment checks for HR-managed records."
        actions={
          canWrite ? (
            <PpeFormDialog
              employees={employees}
              trigger={
                <Button>
                  <Plus className="size-4" /> New PPE Check
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="Search PPE checks…"
        emptyMessage="No PPE checks recorded yet."
      />
    </div>
  );
}
