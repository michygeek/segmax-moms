"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatNumber } from "@/lib/utils";

type Movement = {
  id: string;
  itemType: string;
  type: string;
  quantity: number;
  fromLocation: string | null;
  toLocation: string | null;
  reference: string | null;
  createdAt: Date;
  stockLot: { lotNumber: string; rawMaterial: { name: string } } | null;
  finishedGood: { product: { name: string } } | null;
  user: { name: string };
};

export function MovementsTable({ movements }: { movements: Movement[] }) {
  const columns: ColumnDef<Movement>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <StatusBadge status={row.original.type} />,
    },
    {
      id: "item",
      header: "Item",
      accessorFn: (row) =>
        row.stockLot
          ? `${row.stockLot.rawMaterial.name} (${row.stockLot.lotNumber})`
          : row.finishedGood
            ? row.finishedGood.product.name
            : "—",
      cell: ({ row }) =>
        row.original.stockLot ? (
          <div>
            <p>{row.original.stockLot.rawMaterial.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.stockLot.lotNumber}</p>
          </div>
        ) : row.original.finishedGood ? (
          row.original.finishedGood.product.name
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => formatNumber(row.original.quantity),
    },
    {
      id: "movement",
      header: "From / To",
      cell: ({ row }) =>
        row.original.fromLocation || row.original.toLocation
          ? `${row.original.fromLocation ?? "—"} → ${row.original.toLocation ?? "—"}`
          : "—",
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => row.original.reference ?? "—",
    },
    {
      id: "user",
      header: "By",
      accessorFn: (row) => row.user.name,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Stock Movements" description="Full audit log of every inventory movement, newest first." />
      <DataTable
        columns={columns}
        data={movements}
        searchPlaceholder="Search movements…"
        emptyMessage="No stock movements yet."
      />
    </div>
  );
}
