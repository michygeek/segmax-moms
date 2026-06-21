"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  closeIncidentAction,
  startIncidentInvestigationAction,
} from "@/app/(dashboard)/safety/incidents/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type PendingAction = "INVESTIGATE" | "CLOSE" | null;

export function IncidentActions({ incidentId, status }: { incidentId: string; status: string }) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  if (status === "CLOSED") return null;

  function handleConfirm() {
    if (!pending) return;
    startTransition(async () => {
      try {
        if (pending === "INVESTIGATE") await startIncidentInvestigationAction(incidentId);
        if (pending === "CLOSE") await closeIncidentAction(incidentId);
        toast.success("Incident updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update incident.");
      } finally {
        setPending(null);
      }
    });
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        {status === "REPORTED" && (
          <Button size="sm" onClick={() => setPending("INVESTIGATE")}>
            Start Investigation
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setPending("CLOSE")}>
          Close
        </Button>
      </div>
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending === "INVESTIGATE" ? "Start investigation?" : "Close this incident?"}
        confirmLabel={pending === "INVESTIGATE" ? "Start" : "Close"}
        destructive={false}
        loading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
