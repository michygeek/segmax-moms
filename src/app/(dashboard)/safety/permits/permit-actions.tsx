"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approvePermitAction,
  closePermitAction,
  rejectPermitAction,
} from "@/app/(dashboard)/safety/permits/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type PendingAction = "APPROVE" | "REJECT" | "CLOSE" | null;

export function PermitActions({ permitId, status }: { permitId: string; status: string }) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!pending) return;
    startTransition(async () => {
      try {
        if (pending === "APPROVE") await approvePermitAction(permitId);
        if (pending === "REJECT") await rejectPermitAction(permitId);
        if (pending === "CLOSE") await closePermitAction(permitId);
        toast.success("Permit updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update permit.");
      } finally {
        setPending(null);
      }
    });
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        {status === "REQUESTED" && (
          <>
            <Button size="sm" onClick={() => setPending("APPROVE")}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setPending("REJECT")}>
              Reject
            </Button>
          </>
        )}
        {status === "APPROVED" && (
          <Button size="sm" variant="outline" onClick={() => setPending("CLOSE")}>
            Close
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending === "APPROVE"
            ? "Approve this permit?"
            : pending === "REJECT"
              ? "Reject this permit?"
              : "Close this permit?"
        }
        confirmLabel={pending === "APPROVE" ? "Approve" : pending === "REJECT" ? "Reject" : "Close"}
        destructive={pending === "REJECT"}
        loading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
