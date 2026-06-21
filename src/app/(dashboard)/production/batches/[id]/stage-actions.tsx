"use client";

import type { BatchStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { transitionBatchAction } from "@/app/(dashboard)/production/batches/actions";
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

const DESTRUCTIVE_STATUSES: BatchStatus[] = ["ON_HOLD", "REJECTED"];

function statusLabel(status: BatchStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StageActions({
  batchId,
  allowedNext,
}: {
  batchId: string;
  allowedNext: BatchStatus[];
}) {
  const [target, setTarget] = useState<BatchStatus | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  if (allowedNext.length === 0) return null;

  function handleConfirm() {
    if (!target) return;
    startTransition(async () => {
      try {
        await transitionBatchAction(batchId, target, note || undefined);
        toast.success(`Batch moved to ${statusLabel(target)}.`);
        setTarget(null);
        setNote("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update batch status.");
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allowedNext.map((status) => (
          <Button
            key={status}
            variant={DESTRUCTIVE_STATUSES.includes(status) ? "destructive" : "default"}
            size="sm"
            onClick={() => setTarget(status)}
          >
            {statusLabel(status)}
          </Button>
        ))}
      </div>
      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to {target ? statusLabel(target) : ""}</DialogTitle>
            <DialogDescription>
              This will be recorded on the batch&apos;s production log. Add an optional note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="stage-note">Note</Label>
            <Textarea
              id="stage-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional remarks for this stage change"
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
