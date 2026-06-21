"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { setNcrStatusAction } from "@/app/(dashboard)/quality/ncr/actions";
import { NcrFormDialog } from "@/app/(dashboard)/quality/ncr/ncr-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";

type Ncr = {
  id: string;
  batchId: string | null;
  description: string;
  rootCause: string | null;
  correctiveAction: string | null;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: Date;
  closedAt: Date | null;
  batch: { batchNumber: string } | null;
  raisedBy: { name: string };
};

type BatchOption = { id: string; batchNumber: string; product: { name: string } };

export function NcrTable({
  ncrs,
  batches,
  canWrite,
}: {
  ncrs: Ncr[];
  batches: BatchOption[];
  canWrite: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(id: string, status: "IN_PROGRESS" | "CLOSED") {
    startTransition(async () => {
      try {
        await setNcrStatusAction(id, status);
        toast.success(status === "CLOSED" ? "NCR closed." : "NCR marked in progress.");
      } catch {
        toast.error("Could not update NCR status.");
      }
    });
  }

  const columns: ColumnDef<Ncr>[] = [
    {
      id: "description",
      header: "Description",
      accessorFn: (row) => row.description,
      cell: ({ row }) => (
        <p className="max-w-md truncate" title={row.original.description}>
          {row.original.description}
        </p>
      ),
    },
    {
      id: "batch",
      header: "Batch",
      cell: ({ row }) => row.original.batch?.batchNumber ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "raisedBy",
      header: "Raised By",
      accessorFn: (row) => row.raisedBy.name,
    },
    {
      accessorKey: "createdAt",
      header: "Raised",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Ncr } }) => (
              <div className="flex justify-end gap-1">
                <NcrFormDialog
                  ncr={row.original}
                  batches={batches}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                {row.original.status === "OPEN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatus(row.original.id, "IN_PROGRESS")}
                  >
                    Start Progress
                  </Button>
                )}
                {row.original.status !== "CLOSED" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatus(row.original.id, "CLOSED")}
                  >
                    Close
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Non-Conformance Reports"
        description="Track and resolve quality deviations across production batches."
        actions={
          canWrite ? (
            <NcrFormDialog
              batches={batches}
              trigger={
                <Button>
                  <Plus className="size-4" /> Raise NCR
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={ncrs} searchPlaceholder="Search NCRs…" emptyMessage="No non-conformance reports yet." />
    </div>
  );
}
