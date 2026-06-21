"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { matchBatchToOrderAction } from "@/app/(dashboard)/sales/orders/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";

type FinishedGood = { id: string; quantity: number; uom: string };

type OrderItem = {
  id: string;
  quantity: number;
  uom: string;
  finishedGoodId: string | null;
  product: { id: string; name: string; sku: string };
};

export function MatchBatchDialog({
  orderId,
  items,
  finishedGoodsByProduct,
}: {
  orderId: string;
  items: OrderItem[];
  finishedGoodsByProduct: Record<string, FinishedGood[]>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const unmatchedItems = useMemo(() => items.filter((i) => !i.finishedGoodId), [items]);

  const [selections, setSelections] = useState<Record<string, string>>({});

  if (unmatchedItems.length === 0) return null;

  function handleSubmit() {
    const matches = unmatchedItems
      .map((item) => ({ itemId: item.id, finishedGoodId: selections[item.id] }))
      .filter((m): m is { itemId: string; finishedGoodId: string } => !!m.finishedGoodId);

    if (matches.length !== unmatchedItems.length) {
      toast.error("Select a finished good for every line item.");
      return;
    }

    startTransition(async () => {
      try {
        await matchBatchToOrderAction(orderId, { matches });
        toast.success("Batches matched to order.");
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not match batches.");
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Match Batch to Order
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Batch to Order</DialogTitle>
            <DialogDescription>
              Select an available finished good (in storage) for each line item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {unmatchedItems.map((item) => {
              const options = finishedGoodsByProduct[item.product.id] ?? [];
              return (
                <div key={item.id} className="space-y-1.5">
                  <Label>
                    {item.product.name} ({item.product.sku}) — {formatNumber(item.quantity)} {item.uom}
                  </Label>
                  <Select
                    value={selections[item.id] ?? ""}
                    onValueChange={(value) => setSelections((s) => ({ ...s, [item.id]: value ?? "" }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={options.length === 0 ? "No finished goods in storage" : "Select…"} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((fg) => (
                        <SelectItem key={fg.id} value={fg.id}>
                          {formatNumber(fg.quantity)} {fg.uom} available
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button disabled={isPending} onClick={handleSubmit}>
              Confirm Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
