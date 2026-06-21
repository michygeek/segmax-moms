"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { unlockLotoAction } from "@/app/(dashboard)/safety/lotos/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function LotoActions({ lotoId, status }: { lotoId: string; status: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (status !== "LOCKED") return null;

  function handleConfirm() {
    startTransition(async () => {
      try {
        await unlockLotoAction(lotoId);
        toast.success("Equipment unlocked.");
        setConfirmOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not unlock equipment.");
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)}>
          Unlock
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Unlock this equipment?"
        description="This marks the lockout as resolved and records who unlocked it."
        confirmLabel="Unlock"
        destructive={false}
        loading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
