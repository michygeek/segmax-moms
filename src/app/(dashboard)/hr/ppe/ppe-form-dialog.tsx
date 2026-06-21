"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createHrPpeRecordAction } from "@/app/(dashboard)/hr/ppe/actions";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { CheckboxFormField, DateFormField, SelectFormField, TextFormField } from "@/components/shared/form-fields";
import { ppeRecordSchema, type PpeRecordInput } from "@/lib/validations/hr";

type Employee = { id: string; fullName: string; employeeCode: string };

const DEFAULT_ITEMS = [
  { item: "Helmet", compliant: true },
  { item: "Safety Boots", compliant: true },
  { item: "Gloves", compliant: true },
  { item: "Safety Goggles", compliant: true },
];

export function PpeFormDialog({ employees, trigger }: { employees: Employee[]; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset, watch, setValue } = useForm<PpeRecordInput>({
    resolver: zodResolver(ppeRecordSchema),
    defaultValues: {
      employeeId: "",
      checkDate: new Date(),
      items: DEFAULT_ITEMS,
      compliant: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  useEffect(() => {
    const allCompliant = items.length > 0 && items.every((i) => i.compliant);
    setValue("compliant", allCompliant);
  }, [items, setValue]);

  function onSubmit(values: PpeRecordInput) {
    startTransition(async () => {
      try {
        await createHrPpeRecordAction(values);
        toast.success("PPE check recorded.");
        reset({ employeeId: "", checkDate: new Date(), items: DEFAULT_ITEMS, compliant: true });
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New PPE Check</DialogTitle>
          <DialogDescription>Record a PPE compliance check for an employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="employeeId" label="Employee" options={employeeOptions} required />
            <DateFormField control={control} name="checkDate" label="Check Date" required />

            <Field>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">PPE Items</span>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ item: "", compliant: true })}>
                  <Plus className="size-4" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <TextFormField control={control} name={`items.${index}.item`} label="" placeholder="Item name" />
                    <CheckboxFormField control={control} name={`items.${index}.compliant`} label="OK" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Field>

            <CheckboxFormField
              control={control}
              name="compliant"
              label="Overall Compliant"
              description="Auto-computed from items above; override if needed."
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save PPE Check
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
