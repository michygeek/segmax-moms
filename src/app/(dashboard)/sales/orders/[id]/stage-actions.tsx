"use client";

import type { OrderStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { confirmDeliveryAction, transitionOrderAction } from "@/app/(dashboard)/sales/orders/actions";
import { DispatchDialog } from "@/app/(dashboard)/sales/orders/[id]/dispatch-dialog";
import { MatchBatchDialog } from "@/app/(dashboard)/sales/orders/[id]/match-batch-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DESTRUCTIVE_STATUSES: OrderStatus[] = ["CANCELLED"];

function statusLabel(status: OrderStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type FinishedGood = { id: string; quantity: number; uom: string };

type OrderItem = {
  id: string;
  quantity: number;
  uom: string;
  finishedGoodId: string | null;
  product: { id: string; name: string; sku: string };
};

export function StageActions({
  orderId,
  allowedNext,
  items,
  finishedGoodsByProduct,
}: {
  orderId: string;
  allowedNext: OrderStatus[];
  items: OrderItem[];
  finishedGoodsByProduct: Record<string, FinishedGood[]>;
}) {
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  if (allowedNext.length === 0) return null;

  function handleConfirm() {
    if (!target) return;
    startTransition(async () => {
      try {
        await transitionOrderAction(orderId, target, note || undefined);
        toast.success(`Order moved to ${statusLabel(target)}.`);
        setTarget(null);
        setNote("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update order status.");
      }
    });
  }

  function handleConfirmDelivery() {
    startTransition(async () => {
      try {
        await confirmDeliveryAction(orderId);
        toast.success("Delivery confirmed.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not confirm delivery.");
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allowedNext.map((status) => {
          if (status === "BATCH_MATCHED") {
            return <MatchBatchDialog key={status} orderId={orderId} items={items} finishedGoodsByProduct={finishedGoodsByProduct} />;
          }
          if (status === "DISPATCHED") {
            return <DispatchDialog key={status} orderId={orderId} />;
          }
          if (status === "DELIVERED") {
            return (
              <Button key={status} size="sm" disabled={isPending} onClick={handleConfirmDelivery}>
                Confirm Delivery
              </Button>
            );
          }
          return (
            <Button
              key={status}
              variant={DESTRUCTIVE_STATUSES.includes(status) ? "destructive" : "default"}
              size="sm"
              onClick={() => setTarget(status)}
            >
              {statusLabel(status)}
            </Button>
          );
        })}
      </div>
      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to {target ? statusLabel(target) : ""}</DialogTitle>
            <DialogDescription>
              This will be recorded on the order&apos;s audit trail. Add an optional note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="stage-note">Note</Label>
            <Textarea
              id="stage-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional remarks for this status change"
            />
          </div>
          <DialogFooter>
            <Button
              variant={target && DESTRUCTIVE_STATUSES.includes(target) ? "destructive" : "default"}
              disabled={isPending}
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
