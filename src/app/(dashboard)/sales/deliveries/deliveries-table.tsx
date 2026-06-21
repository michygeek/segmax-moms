"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";

type DeliveryRow = {
  id: string;
  deliveryNumber: string;
  vehicleNo: string | null;
  driverName: string | null;
  status: string;
  dispatchedAt: Date | null;
  confirmedAt: Date | null;
  order: { id: string; orderNumber: string; customer: { name: string } };
};

export function DeliveriesTable({ deliveries }: { deliveries: DeliveryRow[] }) {
  const columns: ColumnDef<DeliveryRow>[] = [
    {
      accessorKey: "deliveryNumber",
      header: "Delivery No.",
      cell: ({ row }) => (
        <Link
          href={`/sales/orders/${row.original.order.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.deliveryNumber}
        </Link>
      ),
    },
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => (
        <Link href={`/sales/orders/${row.original.order.id}`} className="hover:underline">
          {row.original.order.orderNumber}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.order.customer.name,
    },
    { accessorKey: "vehicleNo", header: "Vehicle No.", cell: ({ row }) => row.original.vehicleNo ?? "—" },
    { accessorKey: "driverName", header: "Driver", cell: ({ row }) => row.original.driverName ?? "—" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "dispatchedAt",
      header: "Dispatched",
      cell: ({ row }) => formatDateTime(row.original.dispatchedAt),
    },
    {
      accessorKey: "confirmedAt",
      header: "Confirmed",
      cell: ({ row }) => formatDateTime(row.original.confirmedAt),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Deliveries" description="All delivery notes raised against dispatched sales orders." />
      <DataTable columns={columns} data={deliveries} searchPlaceholder="Search deliveries…" emptyMessage="No deliveries yet." />
    </div>
  );
}
