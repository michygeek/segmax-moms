"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

import { SupplierFormDialog } from "@/app/(dashboard)/inventory/suppliers/supplier-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";

type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export function SuppliersTable({ suppliers, canWrite }: { suppliers: Supplier[]; canWrite: boolean }) {
  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "contactName", header: "Contact", cell: ({ row }) => row.original.contactName ?? "—" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Supplier } }) => (
              <div className="flex justify-end gap-1">
                <SupplierFormDialog
                  supplier={row.original}
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
        title="Suppliers"
        description="Vendors supplying raw materials to SEGMAX."
        actions={
          canWrite ? (
            <SupplierFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Supplier
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={suppliers} searchPlaceholder="Search suppliers…" emptyMessage="No suppliers yet." />
    </div>
  );
}
