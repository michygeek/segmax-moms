"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { AttendanceFormDialog } from "@/app/(dashboard)/hr/attendance/attendance-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";

type Employee = { id: string; fullName: string; employeeCode: string };

type AttendanceRow = {
  id: string;
  date: Date;
  clockIn: Date | null;
  clockOut: Date | null;
  status: string;
  handoverNotes: string | null;
  employee: { fullName: string; employeeCode: string };
};

export function AttendanceTable({
  records,
  employees,
  canWrite,
}: {
  records: AttendanceRow[];
  employees: Employee[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<AttendanceRow>[] = [
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
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "clockIn", header: "Clock In", cell: ({ row }) => formatDateTime(row.original.clockIn) },
    { accessorKey: "clockOut", header: "Clock Out", cell: ({ row }) => formatDateTime(row.original.clockOut) },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "handoverNotes",
      header: "Handover Notes",
      cell: ({ row }) => row.original.handoverNotes ?? "—",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description="Daily attendance, clock-in/out, and handover notes."
        actions={
          canWrite ? (
            <AttendanceFormDialog
              employees={employees}
              trigger={
                <Button>
                  <Plus className="size-4" /> Record Attendance
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="Search attendance…"
        emptyMessage="No attendance records yet."
      />
    </div>
  );
}
