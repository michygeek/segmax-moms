"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

import { ComplaintFormDialog } from "@/app/(dashboard)/sales/complaints/complaint-form-dialog";
import { ResolveComplaintDialog } from "@/app/(dashboard)/sales/complaints/resolve-complaint-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";

type Customer = { id: string; name: string };
type Order = { id: string; orderNumber: string };

type Complaint = {
  id: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  resolution: string | null;
  raisedAt: Date;
  resolvedAt: Date | null;
  customerId: string;
  orderId: string | null;
  customer: { name: string };
  order: { orderNumber: string } | null;
  handledBy: { name: string } | null;
};

export function ComplaintsTable({
  complaints,
  customers,
  orders,
  canWrite,
}: {
  complaints: Complaint[];
  customers: Customer[];
  orders: Order[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<Complaint>[] = [
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.customer.name,
    },
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => row.original.order?.orderNumber ?? "—",
    },
    { accessorKey: "description", header: "Description", cell: ({ row }) => (
      <p className="max-w-xs truncate">{row.original.description}</p>
    ) },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "handledBy",
      header: "Handled By",
      cell: ({ row }) => row.original.handledBy?.name ?? "—",
    },
    {
      accessorKey: "raisedAt",
      header: "Raised",
      cell: ({ row }) => formatDateTime(row.original.raisedAt),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Complaint } }) => (
              <div className="flex justify-end gap-1">
                {row.original.status !== "RESOLVED" && (
                  <ResolveComplaintDialog complaintId={row.original.id} />
                )}
                <ComplaintFormDialog
                  complaint={row.original}
                  customers={customers}
                  orders={orders}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer Complaints"
        description="Track and resolve customer complaints."
        actions={
          canWrite ? (
            <ComplaintFormDialog
              customers={customers}
              orders={orders}
              trigger={
                <Button>
                  <Plus className="size-4" /> New Complaint
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={complaints}
        searchPlaceholder="Search complaints…"
        emptyMessage="No complaints logged."
      />
    </div>
  );
}
