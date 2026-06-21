"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { dispatchFinishedGoodAction } from "@/app/(dashboard)/inventory/finished-goods/actions";
import { TransferLocationDialog } from "@/app/(dashboard)/inventory/finished-goods/transfer-location-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatNumber } from "@/lib/utils";

type FinishedGood = {
  id: string;
  quantity: number;
  uom: string;
  expiryDate: Date | null;
  status: string;
  product: { name: string; sku: string };
  batch: { batchNumber: string };
  storageLocation: { name: string } | null;
};

type StorageLocation = { id: string; name: string };

export function FinishedGoodsTable({
  finishedGoods,
  storageLocations,
  canWrite,
}: {
  finishedGoods: FinishedGood[];
  storageLocations: StorageLocation[];
  canWrite: boolean;
}) {
  const [transferTarget, setTransferTarget] = useState<FinishedGood | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState<FinishedGood | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<FinishedGood>[] = [
    {
      id: "product",
      header: "Product",
      accessorFn: (row) => row.product.name,
      cell: ({ row }) => (
        <div>
          <p>{row.original.product.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.product.sku}</p>
        </div>
      ),
    },
    {
      id: "batch",
      header: "Batch No.",
      accessorFn: (row) => row.batch.batchNumber,
    },
    {
      id: "qty",
      header: "Quantity",
      cell: ({ row }) => `${formatNumber(row.original.quantity)} ${row.original.uom}`,
    },
    {
      id: "storageLocation",
      header: "Location",
      accessorFn: (row) => row.storageLocation?.name ?? "",
      cell: ({ row }) => row.original.storageLocation?.name ?? "—",
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => formatDate(row.original.expiryDate),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: FinishedGood } }) =>
              row.original.status === "DISPATCHED" ? null : (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTransferTarget(row.original)}>
                      Transfer Location
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDispatchTarget(row.original)}
                    >
                      Dispatch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
          },
        ]
      : []),
  ];

  function handleDispatch() {
    if (!dispatchTarget) return;
    startTransition(async () => {
      try {
        await dispatchFinishedGoodAction(dispatchTarget.id);
        toast.success("Finished good dispatched.");
      } catch {
        toast.error("Could not dispatch finished good.");
      } finally {
        setDispatchTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Finished Goods"
        description="Finished product stock created automatically when batches reach the Stored stage."
      />
      <DataTable
        columns={columns}
        data={finishedGoods}
        searchPlaceholder="Search finished goods…"
        emptyMessage="No finished goods yet."
      />

      {transferTarget && (
        <TransferLocationDialog
          finishedGoodId={transferTarget.id}
          storageLocations={storageLocations}
          open={!!transferTarget}
          onOpenChange={(open) => !open && setTransferTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!dispatchTarget}
        onOpenChange={(open) => !open && setDispatchTarget(null)}
        title="Dispatch this finished good?"
        description={`This will mark ${formatNumber(dispatchTarget?.quantity ?? 0)} ${dispatchTarget?.uom ?? ""} of ${dispatchTarget?.product.name ?? ""} as dispatched.`}
        confirmLabel="Dispatch"
        loading={isPending}
        onConfirm={handleDispatch}
      />
    </div>
  );
}
