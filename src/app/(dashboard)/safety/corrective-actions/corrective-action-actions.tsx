"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { completeCorrectiveActionAction } from "@/app/(dashboard)/safety/corrective-actions/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function CorrectiveActionActions({ actionId, status }: { actionId: string; status: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (status === "COMPLETED") return null;

  function handleConfirm() {
    startTransition(async () => {
      try {
        await completeCorrectiveActionAction(actionId);
        toast.success("Corrective action marked complete.");
        setConfirmOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update corrective action.");
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setConfirmOpen(true)}>
          Mark Complete
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Mark this action complete?"
        confirmLabel="Mark Complete"
        destructive={false}
        loading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
