"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

import { LocationFormDialog } from "@/app/(dashboard)/inventory/locations/location-form-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNumber } from "@/lib/utils";

type StorageLocation = {
  id: string;
  name: string;
  type: "RAW_MATERIAL" | "FINISHED_GOODS";
  capacity: number | null;
};

export function LocationsTable({ locations, canWrite }: { locations: StorageLocation[]; canWrite: boolean }) {
  const columns: ColumnDef<StorageLocation>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <StatusBadge status={row.original.type} />,
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => (row.original.capacity != null ? formatNumber(row.original.capacity) : "—"),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: StorageLocation } }) => (
              <div className="flex justify-end gap-1">
                <LocationFormDialog
                  location={row.original}
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
        title="Storage Locations"
        description="Warehouse bays and storage areas for raw materials and finished goods."
        actions={
          canWrite ? (
            <LocationFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New Location
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={locations} searchPlaceholder="Search locations…" emptyMessage="No storage locations yet." />
    </div>
  );
}
