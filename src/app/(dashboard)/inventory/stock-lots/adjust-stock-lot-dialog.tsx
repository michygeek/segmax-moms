"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { adjustStockLotAction } from "@/app/(dashboard)/inventory/stock-lots/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { SelectFormField, TextareaFormField } from "@/components/shared/form-fields";
import { adjustStockLotSchema, type AdjustStockLotInput } from "@/lib/validations/inventory";

const STATUS_OPTIONS = [
  { label: "Available", value: "AVAILABLE" },
  { label: "Quarantined", value: "QUARANTINED" },
  { label: "Rejected", value: "REJECTED" },
];

export function AdjustStockLotDialog({
  lotId,
  lotNumber,
  currentStatus,
  open,
  onOpenChange,
}: {
  lotId: string;
  lotNumber: string;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<AdjustStockLotInput>({
    resolver: zodResolver(adjustStockLotSchema),
    defaultValues: { status: currentStatus as AdjustStockLotInput["status"], reason: "" },
  });

  function onSubmit(values: AdjustStockLotInput) {
    startTransition(async () => {
      try {
        await adjustStockLotAction(lotId, values);
        toast.success("Stock lot status updated.");
        reset();
        onOpenChange(false);
      } catch {
        toast.error("Could not update stock lot status.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Lot {lotNumber}</DialogTitle>
          <DialogDescription>Change the status of this stock lot and record the reason.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="status" label="Status" options={STATUS_OPTIONS} required />
            <TextareaFormField control={control} name="reason" label="Reason" required placeholder="Reason for this status change" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
