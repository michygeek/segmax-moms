"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, Plus } from "lucide-react";

import { DrillFormDialog } from "@/app/(dashboard)/safety/drills/drill-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type DrillRow = {
  id: string;
  month: number;
  year: number;
  type: string;
  attendees: number;
  notes: string | null;
  conductedBy: { name: string };
};

export function DrillsTable({ drills, canWrite }: { drills: DrillRow[]; canWrite: boolean }) {
  const columns: ColumnDef<DrillRow>[] = [
    {
      id: "period",
      header: "Month / Year",
      cell: ({ row }) => `${MONTH_NAMES[row.original.month - 1] ?? row.original.month} ${row.original.year}`,
    },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "attendees", header: "Attendees" },
    {
      id: "conductedBy",
      header: "Conducted By",
      accessorFn: (row) => row.conductedBy.name,
    },
    { accessorKey: "notes", header: "Notes", cell: ({ row }) => row.original.notes ?? "—" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Safety Drill Records"
        description="Fire evacuation and other safety drills conducted."
        actions={
          canWrite ? (
            <DrillFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Drill Record
                </Button>
              }
            />
          ) : undefined
        }
      />
      {drills.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No drill records yet"
          description="Log the first safety drill to begin tracking."
        />
      ) : (
        <DataTable
          columns={columns}
          data={drills}
          searchPlaceholder="Search drills…"
          emptyMessage="No drill records yet."
        />
      )}
    </div>
  );
}
