"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createShiftAction, updateShiftAction } from "@/app/(dashboard)/hr/shifts/actions";
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
import { TextFormField } from "@/components/shared/form-fields";
import { shiftSchema, type ShiftInput } from "@/lib/validations/hr";

type Shift = { id: string; name: string; startTime: string; endTime: string };

export function ShiftFormDialog({ shift, trigger }: { shift?: Shift; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<ShiftInput>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: shift?.name ?? "",
      startTime: shift?.startTime ?? "",
      endTime: shift?.endTime ?? "",
    },
  });

  function onSubmit(values: ShiftInput) {
    startTransition(async () => {
      try {
        if (shift) {
          await updateShiftAction(shift.id, values);
          toast.success("Shift updated.");
        } else {
          await createShiftAction(values);
          toast.success("Shift created.");
          reset();
        }
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
          <DialogTitle>{shift ? "Edit Shift" : "New Shift"}</DialogTitle>
          <DialogDescription>
            {shift ? "Update the shift details." : "Define a new work shift."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Shift Name" required placeholder="Morning" />
            <TextFormField control={control} name="startTime" label="Start Time" required placeholder="06:00" />
            <TextFormField control={control} name="endTime" label="End Time" required placeholder="14:00" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {shift ? "Save Changes" : "Create Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
