"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Plus } from "lucide-react";

import { IncidentActions } from "@/app/(dashboard)/safety/incidents/incident-actions";
import { IncidentFormDialog } from "@/app/(dashboard)/safety/incidents/incident-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

type IncidentRow = {
  id: string;
  type: string;
  description: string;
  location: string | null;
  severity: string;
  status: string;
  reportedBy: { name: string };
};

export function IncidentsTable({
  incidents,
  canWrite,
}: {
  incidents: IncidentRow[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<IncidentRow>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <StatusBadge status={row.original.type} />,
    },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location ?? "—" },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <StatusBadge status={row.original.severity} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "reportedBy",
      header: "Reported By",
      accessorFn: (row) => row.reportedBy.name,
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: IncidentRow } }) => (
              <IncidentActions incidentId={row.original.id} status={row.original.status} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Safety Incidents"
        description="Spills, injuries, near misses, fires, and other safety incidents."
        actions={
          canWrite ? (
            <IncidentFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> Report Incident
                </Button>
              }
            />
          ) : undefined
        }
      />
      {incidents.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents reported"
          description="Report the first safety incident to begin tracking."
        />
      ) : (
        <DataTable
          columns={columns}
          data={incidents}
          searchPlaceholder="Search incidents…"
          emptyMessage="No incidents reported."
        />
      )}
    </div>
  );
}
