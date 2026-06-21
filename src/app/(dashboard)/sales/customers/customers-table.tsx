"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteCustomerAction } from "@/app/(dashboard)/sales/customers/actions";
import { CustomerFormDialog } from "@/app/(dashboard)/sales/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";

type Customer = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export function CustomersTable({ customers, canWrite }: { customers: Customer[]; canWrite: boolean }) {
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "contactPerson", header: "Contact Person", cell: ({ row }) => row.original.contactPerson ?? "—" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    { accessorKey: "address", header: "Address", cell: ({ row }) => row.original.address ?? "—" },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Customer } }) => (
              <div className="flex justify-end gap-1">
                <CustomerFormDialog
                  customer={row.original}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row.original)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteCustomerAction(deleteTarget.id);
        toast.success("Customer deleted.");
      } catch {
        toast.error("Could not delete customer. It may have related orders or complaints.");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        description="Manage SEGMAX's customer accounts."
        actions={
          canWrite ? (
            <CustomerFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Customer
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={customers} searchPlaceholder="Search customers…" emptyMessage="No customers yet." />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this customer?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
