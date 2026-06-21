"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createDisciplineLogAction, updateDisciplineLogAction } from "@/app/(dashboard)/hr/discipline/actions";
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
import { DateFormField, SelectFormField, TextareaFormField } from "@/components/shared/form-fields";
import { DISCIPLINE_TYPE_VALUES, disciplineLogSchema, type DisciplineLogInput } from "@/lib/validations/hr";

type Employee = { id: string; fullName: string; employeeCode: string };

type DisciplineLog = {
  id: string;
  employeeId: string;
  type: string;
  description: string;
  actionTaken: string | null;
  date: Date;
};

const TYPE_OPTIONS = DISCIPLINE_TYPE_VALUES.map((t) => ({ label: t.replaceAll("_", " "), value: t }));

export function DisciplineFormDialog({
  log,
  employees,
  trigger,
}: {
  log?: DisciplineLog;
  employees: Employee[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<DisciplineLogInput>({
    resolver: zodResolver(disciplineLogSchema),
    defaultValues: {
      employeeId: log?.employeeId ?? "",
      type: (log?.type as DisciplineLogInput["type"]) ?? "VERBAL_WARNING",
      description: log?.description ?? "",
      actionTaken: log?.actionTaken ?? "",
      date: log?.date ?? new Date(),
    },
  });

  function onSubmit(values: DisciplineLogInput) {
    startTransition(async () => {
      try {
        if (log) {
          await updateDisciplineLogAction(log.id, values);
          toast.success("Discipline log updated.");
        } else {
          await createDisciplineLogAction(values);
          toast.success("Discipline log created.");
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
          <DialogTitle>{log ? "Edit Discipline Log" : "New Discipline Log"}</DialogTitle>
          <DialogDescription>
            {log ? "Update this discipline record." : "Record a disciplinary action or commendation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="employeeId" label="Employee" options={employeeOptions} required />
            <SelectFormField control={control} name="type" label="Type" options={TYPE_OPTIONS} required />
            <DateFormField control={control} name="date" label="Date" required />
            <TextareaFormField control={control} name="description" label="Description" required />
            <TextareaFormField control={control} name="actionTaken" label="Action Taken" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {log ? "Save Changes" : "Create Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
