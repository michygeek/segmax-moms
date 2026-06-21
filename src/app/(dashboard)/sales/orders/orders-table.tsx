"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date;
  customer: { name: string };
  items: { id: string }[];
};

export function OrdersTable({ orders, canWrite }: { orders: OrderRow[]; canWrite: boolean }) {
  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order No.",
      cell: ({ row }) => (
        <Link href={`/sales/orders/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.customer.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => row.original.items.length,
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
        title="Sales Orders"
        description="Track every order from placement through to delivery confirmation."
        actions={
          canWrite ? (
            <Button render={<Link href="/sales/orders/new" />}>
              <Plus className="size-4" /> New Order
            </Button>
          ) : undefined
        }
      />
      <DataTable columns={columns} data={orders} searchPlaceholder="Search orders…" emptyMessage="No orders yet." />
    </div>
  );
}
