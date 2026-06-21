"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList, Plus } from "lucide-react";

import { CorrectiveActionActions } from "@/app/(dashboard)/safety/corrective-actions/corrective-action-actions";
import { CorrectiveActionFormDialog } from "@/app/(dashboard)/safety/corrective-actions/corrective-action-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type UserOption = { id: string; name: string };
type LinkOption = { id: string; description: string };

type ActionRow = {
  id: string;
  description: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  assignedTo: { name: string };
  incident: { id: string; description: string } | null;
  ncr: { id: string; description: string } | null;
};

export function CorrectiveActionsTable({
  actions,
  users,
  incidents,
  ncrs,
  canWrite,
}: {
  actions: ActionRow[];
  users: UserOption[];
  incidents: LinkOption[];
  ncrs: LinkOption[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<ActionRow>[] = [
    { accessorKey: "description", header: "Description" },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessorFn: (row) => row.assignedTo.name,
    },
    {
      id: "linkedTo",
      header: "Linked To",
      cell: ({ row }) => {
        if (row.original.incident) return "Incident";
        if (row.original.ncr) return "NCR";
        return "—";
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.dueDate),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: ActionRow } }) => (
              <CorrectiveActionActions actionId={row.original.id} status={row.original.status} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Corrective Actions"
        description="Track corrective actions raised from incidents and non-conformances."
        actions={
          canWrite ? (
            <CorrectiveActionFormDialog
              users={users}
              incidents={incidents}
              ncrs={ncrs}
              trigger={
                <Button>
                  <Plus className="size-4" /> New Corrective Action
                </Button>
              }
            />
          ) : undefined
        }
      />
      {actions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No corrective actions yet"
          description="Create the first corrective action to begin tracking."
        />
      ) : (
        <DataTable
          columns={columns}
          data={actions}
          searchPlaceholder="Search corrective actions…"
          emptyMessage="No corrective actions yet."
        />
      )}
    </div>
  );
}
