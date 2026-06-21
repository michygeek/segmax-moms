"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { resolveComplaintAction } from "@/app/(dashboard)/sales/complaints/actions";
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
import { Textarea } from "@/components/ui/textarea";

export function ResolveComplaintDialog({ complaintId }: { complaintId: string }) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!resolution.trim()) {
      toast.error("Enter the resolution notes.");
      return;
    }

    startTransition(async () => {
      try {
        await resolveComplaintAction(complaintId, resolution);
        toast.success("Complaint resolved.");
        setOpen(false);
        setResolution("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not resolve complaint.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Resolve
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>Enter the resolution notes for this complaint.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="resolution">Resolution</Label>
            <Textarea
              id="resolution"
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how the complaint was resolved"
            />
          </div>
          <DialogFooter>
            <Button disabled={isPending} onClick={handleSubmit}>
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
