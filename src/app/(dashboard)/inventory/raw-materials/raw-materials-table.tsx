"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

import { RawMaterialFormDialog } from "@/app/(dashboard)/inventory/raw-materials/raw-material-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatNumber } from "@/lib/utils";

type RawMaterial = {
  id: string;
  name: string;
  code: string;
  uom: string;
  reorderLevel: number;
  availableStock: number;
};

export function RawMaterialsTable({
  rawMaterials,
  canWrite,
}: {
  rawMaterials: RawMaterial[];
  canWrite: boolean;
}) {
  const columns: ColumnDef<RawMaterial>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "uom", header: "UoM" },
    {
      accessorKey: "availableStock",
      header: "Available Stock",
      cell: ({ row }) => `${formatNumber(row.original.availableStock)} ${row.original.uom}`,
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder Level",
      cell: ({ row }) => {
        const low = row.original.availableStock < row.original.reorderLevel;
        return (
          <span className="flex items-center gap-2">
            {formatNumber(row.original.reorderLevel)} {row.original.uom}
            {low && (
              <Badge variant="outline" className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                Low
              </Badge>
            )}
          </span>
        );
      },
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: RawMaterial } }) => (
              <div className="flex justify-end gap-1">
                <RawMaterialFormDialog
                  rawMaterial={row.original}
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
        title="Raw Materials"
        description="Materials tracked for production with reorder thresholds."
        actions={
          canWrite ? (
            <RawMaterialFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Raw Material
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={rawMaterials}
        searchPlaceholder="Search raw materials…"
        emptyMessage="No raw materials yet."
      />
    </div>
  );
}
