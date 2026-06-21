"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createShiftAssignmentAction } from "@/app/(dashboard)/hr/shifts/actions";
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
import { DateFormField, SelectFormField } from "@/components/shared/form-fields";
import { shiftAssignmentSchema, type ShiftAssignmentInput } from "@/lib/validations/hr";

type Employee = { id: string; fullName: string; employeeCode: string };
type Shift = { id: string; name: string; startTime: string; endTime: string };

export function ShiftAssignmentFormDialog({
  employees,
  shifts,
  trigger,
}: {
  employees: Employee[];
  shifts: Shift[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<ShiftAssignmentInput>({
    resolver: zodResolver(shiftAssignmentSchema),
    defaultValues: {
      employeeId: "",
      shiftId: "",
      date: undefined as unknown as Date,
    },
  });

  function onSubmit(values: ShiftAssignmentInput) {
    startTransition(async () => {
      try {
        await createShiftAssignmentAction(values);
        toast.success("Shift assignment created.");
        reset();
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  const employeeOptions = employees.map((e) => ({ label: `${e.fullName} (${e.employeeCode})`, value: e.id }));
  const shiftOptions = shifts.map((s) => ({ label: `${s.name} (${s.startTime}–${s.endTime})`, value: s.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Shift Assignment</DialogTitle>
          <DialogDescription>Assign an employee to a shift for a given date.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="employeeId" label="Employee" options={employeeOptions} required />
            <SelectFormField control={control} name="shiftId" label="Shift" options={shiftOptions} required />
            <DateFormField control={control} name="date" label="Date" required />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
