"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { AdjustStockLotDialog } from "@/app/(dashboard)/inventory/stock-lots/adjust-stock-lot-dialog";
import { ReceiveStockDialog } from "@/app/(dashboard)/inventory/stock-lots/receive-stock-dialog";
import { UploadCoaDialog } from "@/app/(dashboard)/inventory/stock-lots/upload-coa-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatNumber } from "@/lib/utils";

type StockLot = {
  id: string;
  lotNumber: string;
  quantityReceived: number;
  quantityRemaining: number;
  uom: string;
  receivedDate: Date;
  expiryDate: Date | null;
  status: string;
  coaUrl: string | null;
  rawMaterial: { name: string; code: string };
  supplier: { name: string } | null;
  storageLocation: { name: string } | null;
};

type RawMaterial = { id: string; name: string; uom: string };
type Supplier = { id: string; name: string };
type StorageLocation = { id: string; name: string };

function expiryTone(expiryDate: Date | null): "danger" | "warning" | null {
  if (!expiryDate) return null;
  const daysLeft = (new Date(expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
  if (daysLeft < 0) return "danger";
  if (daysLeft <= 30) return "warning";
  return null;
}

export function StockLotsTable({
  lots,
  rawMaterials,
  suppliers,
  storageLocations,
  canWrite,
}: {
  lots: StockLot[];
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  storageLocations: StorageLocation[];
  canWrite: boolean;
}) {
  const [adjustTarget, setAdjustTarget] = useState<StockLot | null>(null);
  const [coaTarget, setCoaTarget] = useState<StockLot | null>(null);

  const columns: ColumnDef<StockLot>[] = [
    { accessorKey: "lotNumber", header: "Lot No." },
    {
      id: "rawMaterial",
      header: "Raw Material",
      accessorFn: (row) => row.rawMaterial.name,
      cell: ({ row }) => (
        <div>
          <p>{row.original.rawMaterial.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.rawMaterial.code}</p>
        </div>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      accessorFn: (row) => row.supplier?.name ?? "",
      cell: ({ row }) => row.original.supplier?.name ?? "—",
    },
    {
      id: "qty",
      header: "Qty Received / Remaining",
      cell: ({ row }) =>
        `${formatNumber(row.original.quantityReceived)} / ${formatNumber(row.original.quantityRemaining)} ${row.original.uom}`,
    },
    {
      accessorKey: "receivedDate",
      header: "Received",
      cell: ({ row }) => formatDate(row.original.receivedDate),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const tone = expiryTone(row.original.expiryDate);
        if (!row.original.expiryDate) return "—";
        return (
          <span className="flex items-center gap-2">
            {formatDate(row.original.expiryDate)}
            {tone === "danger" && (
              <Badge variant="outline" className="border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400">
                Expired
              </Badge>
            )}
            {tone === "warning" && (
              <Badge variant="outline" className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                Expiring Soon
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      id: "storageLocation",
      header: "Location",
      accessorFn: (row) => row.storageLocation?.name ?? "",
      cell: ({ row }) => row.original.storageLocation?.name ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "coa",
      header: "COA",
      cell: ({ row }) =>
        row.original.coaUrl ? (
          <a
            href={row.original.coaUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            View <ExternalLink className="size-3" />
          </a>
        ) : (
          "—"
        ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: StockLot } }) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAdjustTarget(row.original)}>
                    Adjust / Quarantine
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCoaTarget(row.original)}>
                    Upload COA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stock Lots (FIFO)"
        description="Raw material lots ordered oldest-received-first to support FIFO consumption."
        actions={
          canWrite ? (
            <ReceiveStockDialog
              rawMaterials={rawMaterials}
              suppliers={suppliers}
              storageLocations={storageLocations}
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={lots} searchPlaceholder="Search stock lots…" emptyMessage="No stock lots yet." />

      {adjustTarget && (
        <AdjustStockLotDialog
          lotId={adjustTarget.id}
          lotNumber={adjustTarget.lotNumber}
          currentStatus={adjustTarget.status}
          open={!!adjustTarget}
          onOpenChange={(open) => !open && setAdjustTarget(null)}
        />
      )}
      {coaTarget && (
        <UploadCoaDialog
          lotId={coaTarget.id}
          lotNumber={coaTarget.lotNumber}
          open={!!coaTarget}
          onOpenChange={(open) => !open && setCoaTarget(null)}
        />
      )}
    </div>
  );
}
