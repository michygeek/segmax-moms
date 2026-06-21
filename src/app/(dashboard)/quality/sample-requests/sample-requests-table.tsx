"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

type SampleRequestRow = {
  id: string;
  status: string;
  createdAt: Date;
  notes: string | null;
  batch: { batchNumber: string; product: { name: string; sku: string } };
  requestedBy: { name: string };
  labTest: { result: string } | null;
};

export function SampleRequestsTable({
  sampleRequests,
  canWrite,
}: {
  sampleRequests: SampleRequestRow[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<SampleRequestRow>[] = [
    {
      id: "batch",
      header: "Batch",
      accessorFn: (row) => row.batch.batchNumber,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.batch.batchNumber}</p>
          <p className="text-xs text-muted-foreground">{row.original.batch.product.name}</p>
        </div>
      ),
    },
    {
      id: "requestedBy",
      header: "Requested By",
      accessorFn: (row) => row.requestedBy.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.labTest ? row.original.labTest.result : row.original.status} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Requested",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original.status === "PENDING" ? (
            canWrite ? (
              <Button
                size="sm"
                render={<Link href={`/quality/sample-requests/${row.original.id}`} />}
              >
                Run Lab Test
              </Button>
            ) : null
          ) : (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/quality/sample-requests/${row.original.id}`} />}
            >
              View Results
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="QC Sample Requests"
        description="Lab test queue generated automatically when batches reach Lab Test Pending."
      />
      {sampleRequests.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No sample requests yet"
          description="Sample requests are created automatically when a production batch moves to Lab Test Pending."
        />
      ) : (
        <DataTable
          columns={columns}
          data={sampleRequests}
          searchPlaceholder="Search sample requests…"
          emptyMessage="No sample requests yet."
        />
      )}
    </div>
  );
}
