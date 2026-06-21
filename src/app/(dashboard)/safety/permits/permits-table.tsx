"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileWarning, Plus } from "lucide-react";

import { PermitActions } from "@/app/(dashboard)/safety/permits/permit-actions";
import { PermitFormDialog } from "@/app/(dashboard)/safety/permits/permit-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type PermitRow = {
  id: string;
  location: string;
  description: string;
  status: string;
  validFrom: Date;
  validTo: Date;
  requestedBy: { name: string };
  approvedBy: { name: string } | null;
};

export function PermitsTable({ permits, canWrite }: { permits: PermitRow[]; canWrite: boolean }) {
  const columns: ColumnDef<PermitRow>[] = [
    { accessorKey: "location", header: "Location" },
    { accessorKey: "description", header: "Description" },
    {
      id: "requestedBy",
      header: "Requested By",
      accessorFn: (row) => row.requestedBy.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "validFrom",
      header: "Valid From",
      cell: ({ row }) => formatDate(row.original.validFrom),
    },
    {
      accessorKey: "validTo",
      header: "Valid To",
      cell: ({ row }) => formatDate(row.original.validTo),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: PermitRow } }) => (
              <PermitActions permitId={row.original.id} status={row.original.status} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hot Work Permits"
        description="Authorization and tracking for hot work activities."
        actions={
          canWrite ? (
            <PermitFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Permit
                </Button>
              }
            />
          ) : undefined
        }
      />
      {permits.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="No hot work permits yet"
          description="Request the first hot work permit to get started."
        />
      ) : (
        <DataTable
          columns={columns}
          data={permits}
          searchPlaceholder="Search permits…"
          emptyMessage="No hot work permits yet."
        />
      )}
    </div>
  );
}
