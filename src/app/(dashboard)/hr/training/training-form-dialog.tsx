"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createTrainingRecordAction, updateTrainingRecordAction } from "@/app/(dashboard)/hr/training/actions";
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
import { DateFormField, SelectFormField, TextFormField } from "@/components/shared/form-fields";
import { trainingRecordSchema, type TrainingRecordInput } from "@/lib/validations/hr";

type Employee = { id: string; fullName: string; employeeCode: string };

type TrainingRecord = {
  id: string;
  employeeId: string;
  trainingName: string;
  completedDate: Date;
  expiryDate: Date | null;
  certificateUrl: string | null;
};

export function TrainingFormDialog({
  record,
  employees,
  trigger,
}: {
  record?: TrainingRecord;
  employees: Employee[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<TrainingRecordInput>({
    resolver: zodResolver(trainingRecordSchema),
    defaultValues: {
      employeeId: record?.employeeId ?? "",
      trainingName: record?.trainingName ?? "",
      completedDate: record?.completedDate ?? (undefined as unknown as Date),
      expiryDate: record?.expiryDate ?? null,
      certificateUrl: record?.certificateUrl ?? "",
    },
  });

  function onSubmit(values: TrainingRecordInput) {
    startTransition(async () => {
      try {
        if (record) {
          await updateTrainingRecordAction(record.id, values);
          toast.success("Training record updated.");
        } else {
          await createTrainingRecordAction(values);
          toast.success("Training record created.");
          reset();
        }
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const employeeOptions = employees.map((e) => ({ label: `${e.fullName} (${e.employeeCode})`, value: e.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "Edit Training Record" : "New Training Record"}</DialogTitle>
          <DialogDescription>
            {record ? "Update the training record details." : "Log a completed training for an employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="employeeId" label="Employee" options={employeeOptions} required />
            <TextFormField control={control} name="trainingName" label="Training Name" required />
            <DateFormField control={control} name="completedDate" label="Completed Date" required />
            <DateFormField control={control} name="expiryDate" label="Expiry Date" />
            <TextFormField
              control={control}
              name="certificateUrl"
              label="Certificate URL"
              placeholder="https://… (or upload a file after saving)"
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {record ? "Save Changes" : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
