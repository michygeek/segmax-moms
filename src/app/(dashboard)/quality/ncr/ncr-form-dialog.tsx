"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createNcrAction, updateNcrAction } from "@/app/(dashboard)/quality/ncr/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { SelectFormField, TextareaFormField } from "@/components/shared/form-fields";
import { ncrSchema, type NcrInput } from "@/lib/validations/quality";

type Ncr = {
  id: string;
  batchId: string | null;
  description: string;
  rootCause: string | null;
  correctiveAction: string | null;
};

type BatchOption = { id: string; batchNumber: string; product: { name: string } };

export function NcrFormDialog({
  ncr,
  batches,
  trigger,
}: {
  ncr?: Ncr;
  batches: BatchOption[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<NcrInput>({
    resolver: zodResolver(ncrSchema),
    defaultValues: {
      batchId: ncr?.batchId ?? "",
      description: ncr?.description ?? "",
      rootCause: ncr?.rootCause ?? "",
      correctiveAction: ncr?.correctiveAction ?? "",
    },
  });

  function onSubmit(values: NcrInput) {
    startTransition(async () => {
      try {
        if (ncr) {
          await updateNcrAction(ncr.id, values);
          toast.success("Non-Conformance Report updated.");
        } else {
          await createNcrAction(values);
          toast.success("Non-Conformance Report raised.");
          reset();
        }
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const batchOptions = batches.map((b) => ({
    label: `${b.batchNumber} — ${b.product.name}`,
    value: b.id,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ncr ? "Edit Non-Conformance Report" : "Raise Non-Conformance Report"}</DialogTitle>
          <DialogDescription>
            {ncr ? "Update the NCR details." : "Document a quality deviation, linked to a batch if applicable."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField
              control={control}
              name="batchId"
              label="Linked Batch (optional)"
              options={batchOptions}
              placeholder="No batch selected"
            />
            <TextareaFormField
              control={control}
              name="description"
              label="Description"
              required
              placeholder="Describe the non-conformance"
            />
            <TextareaFormField
              control={control}
              name="rootCause"
              label="Root Cause"
              placeholder="Optional root cause analysis"
            />
            <TextareaFormField
              control={control}
              name="correctiveAction"
              label="Corrective Action"
              placeholder="Optional corrective action plan"
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {ncr ? "Save Changes" : "Raise NCR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
