"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { disposeRetentionSampleAction } from "@/app/(dashboard)/quality/retention-samples/actions";
import { RetentionSampleFormDialog } from "@/app/(dashboard)/quality/retention-samples/retention-sample-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatDate } from "@/lib/utils";

type RetentionSample = {
  id: string;
  batchId: string;
  location: string;
  retainedUntil: Date;
  disposed: boolean;
  createdAt: Date;
  batch: { batchNumber: string };
};

type BatchOption = { id: string; batchNumber: string; product: { name: string } };

function isOverdue(sample: RetentionSample) {
  return !sample.disposed && new Date(sample.retainedUntil).getTime() < Date.now();
}

export function RetentionSamplesTable({
  samples,
  batches,
  canWrite,
}: {
  samples: RetentionSample[];
  batches: BatchOption[];
  canWrite: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDispose(id: string) {
    startTransition(async () => {
      try {
        await disposeRetentionSampleAction(id);
        toast.success("Retention sample marked as disposed.");
      } catch {
        toast.error("Could not update retention sample.");
      }
    });
  }

  const columns: ColumnDef<RetentionSample>[] = [
    {
      id: "batch",
      header: "Batch",
      accessorFn: (row) => row.batch.batchNumber,
    },
    { accessorKey: "location", header: "Location" },
    {
      accessorKey: "retainedUntil",
      header: "Retained Until",
      cell: ({ row }) => (
        <span className={cn(isOverdue(row.original) && "font-medium text-destructive")}>
          {formatDate(row.original.retainedUntil)}
          {isOverdue(row.original) && " (overdue)"}
        </span>
      ),
    },
    {
      accessorKey: "disposed",
      header: "Status",
      cell: ({ row }) =>
        row.original.disposed ? (
          <StatusBadge status="DISPOSED" />
        ) : isOverdue(row.original) ? (
          <StatusBadge status="EXPIRED" />
        ) : (
          <StatusBadge status="AVAILABLE" />
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Logged",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: RetentionSample } }) => (
              <div className="flex justify-end gap-1">
                <RetentionSampleFormDialog
                  sample={row.original}
                  batches={batches}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                {!row.original.disposed && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDispose(row.original.id)}
                  >
                    Mark Disposed
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
        title="Retention Samples"
        description="Track retained batch samples and their disposal schedule."
        actions={
          canWrite ? (
            <RetentionSampleFormDialog
              batches={batches}
              trigger={
                <Button>
                  <Plus className="size-4" /> Log Sample
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={samples}
        searchPlaceholder="Search retention samples…"
        emptyMessage="No retention samples logged yet."
      />
    </div>
  );
}
