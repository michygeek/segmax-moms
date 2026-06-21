"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createDrillAction } from "@/app/(dashboard)/safety/drills/actions";
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
import { NumberFormField, TextareaFormField, TextFormField } from "@/components/shared/form-fields";
import { createDrillSchema, type CreateDrillInput } from "@/lib/validations/safety";

export function DrillFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const now = new Date();

  const { control, handleSubmit, reset } = useForm<CreateDrillInput>({
    resolver: zodResolver(createDrillSchema),
    defaultValues: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      type: "Fire Evacuation Drill",
      attendees: undefined as unknown as number,
      notes: "",
    },
  });

  function onSubmit(values: CreateDrillInput) {
    startTransition(async () => {
      try {
        await createDrillAction(values);
        toast.success("Drill record created.");
        reset();
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Safety Drill Record</DialogTitle>
          <DialogDescription>Log a completed safety drill.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberFormField control={control} name="month" label="Month" required />
              <NumberFormField control={control} name="year" label="Year" required />
              <NumberFormField control={control} name="attendees" label="Attendees" required />
            </div>
            <TextFormField
              control={control}
              name="type"
              label="Drill Type"
              required
              placeholder="Fire Evacuation Drill"
            />
            <TextareaFormField control={control} name="notes" label="Notes" placeholder="Optional notes" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create Drill Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
