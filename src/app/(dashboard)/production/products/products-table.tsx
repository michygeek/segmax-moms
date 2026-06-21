"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { archiveProductAction } from "@/app/(dashboard)/production/products/actions";
import { ProductFormDialog } from "@/app/(dashboard)/production/products/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  uom: string;
  isActive: boolean;
};

export function ProductsTable({ products, canWrite }: { products: Product[]; canWrite: boolean }) {
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category ?? "—" },
    { accessorKey: "uom", header: "UoM" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "secondary" : "outline"}>
          {row.original.isActive ? "Active" : "Archived"}
        </Badge>
      ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Product } }) => (
              <div className="flex justify-end gap-1">
                <ProductFormDialog
                  product={row.original}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                {row.original.isActive && (
                  <Button variant="ghost" size="icon-sm" onClick={() => setArchiveTarget(row.original)}>
                    <Archive className="size-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  function handleArchive() {
    if (!archiveTarget) return;
    startTransition(async () => {
      try {
        await archiveProductAction(archiveTarget.id);
        toast.success("Product archived.");
      } catch {
        toast.error("Could not archive product.");
      } finally {
        setArchiveTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Finished product SKUs manufactured by SEGMAX."
        actions={
          canWrite ? (
            <ProductFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Product
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={products} searchPlaceholder="Search products…" emptyMessage="No products yet." />
      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archive this product?"
        description={`"${archiveTarget?.name}" will be hidden from new batch creation but existing records are kept.`}
        confirmLabel="Archive"
        loading={isPending}
        onConfirm={handleArchive}
      />
    </div>
  );
}
