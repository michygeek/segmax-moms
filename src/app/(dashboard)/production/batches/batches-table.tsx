"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatNumber } from "@/lib/utils";

type BatchRow = {
  id: string;
  batchNumber: string;
  status: string;
  plannedQty: number;
  uom: string;
  createdAt: Date;
  product: { name: string; sku: string };
};

export function BatchesTable({ batches, canWrite }: { batches: BatchRow[]; canWrite: boolean }) {
  const columns: ColumnDef<BatchRow>[] = [
    {
      accessorKey: "batchNumber",
      header: "Batch No.",
      cell: ({ row }) => (
        <Link href={`/production/batches/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.batchNumber}
        </Link>
      ),
    },
    {
      id: "product",
      header: "Product",
      accessorFn: (row) => row.product.name,
      cell: ({ row }) => (
        <div>
          <p>{row.original.product.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.product.sku}</p>
        </div>
      ),
    },
    {
      id: "qty",
      header: "Planned Qty",
      cell: ({ row }) => `${formatNumber(row.original.plannedQty)} ${row.original.uom}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Production Batches"
        description="Track every batch from raw materials through to finished, stored product."
        actions={
          canWrite ? (
            <Button render={<Link href="/production/batches/new" />}>
              <Plus className="size-4" /> New Batch
            </Button>
          ) : undefined
        }
      />
      <DataTable columns={columns} data={batches} searchPlaceholder="Search batches…" emptyMessage="No batches yet." />
    </div>
  );
}
