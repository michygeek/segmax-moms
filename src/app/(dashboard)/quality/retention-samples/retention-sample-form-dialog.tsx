"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createRetentionSampleAction,
  updateRetentionSampleAction,
} from "@/app/(dashboard)/quality/retention-samples/actions";
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
import {
  CheckboxFormField,
  DateFormField,
  SelectFormField,
  TextFormField,
} from "@/components/shared/form-fields";
import { retentionSampleSchema, type RetentionSampleInput } from "@/lib/validations/quality";

type RetentionSample = {
  id: string;
  batchId: string;
  location: string;
  retainedUntil: Date;
  disposed: boolean;
};

type BatchOption = { id: string; batchNumber: string; product: { name: string } };

export function RetentionSampleFormDialog({
  sample,
  batches,
  trigger,
}: {
  sample?: RetentionSample;
  batches: BatchOption[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<RetentionSampleInput>({
    resolver: zodResolver(retentionSampleSchema),
    defaultValues: {
      batchId: sample?.batchId ?? "",
      location: sample?.location ?? "",
      retainedUntil: sample?.retainedUntil ?? (undefined as unknown as Date),
      disposed: sample?.disposed ?? false,
    },
  });

  function onSubmit(values: RetentionSampleInput) {
    startTransition(async () => {
      try {
        if (sample) {
          await updateRetentionSampleAction(sample.id, values);
          toast.success("Retention sample updated.");
        } else {
          await createRetentionSampleAction(values);
          toast.success("Retention sample logged.");
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
          <DialogTitle>{sample ? "Edit Retention Sample" : "Log Retention Sample"}</DialogTitle>
          <DialogDescription>
            {sample
              ? "Update the retention sample record."
              : "Record a retained sample of a batch for future reference."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField
              control={control}
              name="batchId"
              label="Batch"
              options={batchOptions}
              required
            />
            <TextFormField
              control={control}
              name="location"
              label="Storage Location"
              required
              placeholder="e.g. QC Retention Shelf A3"
            />
            <DateFormField control={control} name="retainedUntil" label="Retained Until" required />
            <CheckboxFormField control={control} name="disposed" label="Disposed" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {sample ? "Save Changes" : "Log Sample"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
