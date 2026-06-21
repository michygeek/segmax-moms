"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPpeCheckinAction } from "@/app/(dashboard)/safety/ppe-checkins/actions";
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
} from "@/components/shared/form-fields";
import { createPpeCheckinSchema, type CreatePpeCheckinInput } from "@/lib/validations/safety";

type Employee = { id: string; fullName: string };

const DEFAULT_ITEMS = [
  { item: "Helmet", compliant: false },
  { item: "Safety Boots", compliant: false },
  { item: "Gloves", compliant: false },
  { item: "Safety Goggles", compliant: false },
  { item: "Hi-Vis Vest", compliant: false },
];

export function PpeCheckinFormDialog({
  employees,
  trigger,
}: {
  employees: Employee[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CreatePpeCheckinInput>({
    resolver: zodResolver(createPpeCheckinSchema),
    defaultValues: {
      employeeId: "",
      checkDate: new Date(),
      items: DEFAULT_ITEMS,
      compliant: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  function onSubmit(values: CreatePpeCheckinInput) {
    startTransition(async () => {
      try {
        await createPpeCheckinAction(values);
        toast.success("PPE check-in recorded.");
        reset({ employeeId: "", checkDate: new Date(), items: DEFAULT_ITEMS, compliant: false });
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const employeeOptions = employees.map((e) => ({ label: e.fullName, value: e.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New PPE Check-in</DialogTitle>
          <DialogDescription>Pre-shift PPE compliance check for an employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectFormField
                control={control}
                name="employeeId"
                label="Employee"
                options={employeeOptions}
                required
              />
              <DateFormField control={control} name="checkDate" label="Check Date" required />
            </div>
          </FieldGroup>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">PPE Items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ item: "", compliant: false })}
              >
                <Plus className="size-4" /> Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end rounded-md border p-3">
                  <SelectFormField
                    control={control}
                    name={`items.${index}.item`}
                    label="Item"
                    options={DEFAULT_ITEMS.map((d) => ({ label: d.item, value: d.item }))}
                    required
                  />
                  <CheckboxFormField control={control} name={`items.${index}.compliant`} label="Compliant" />
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
          </div>

          <CheckboxFormField
            control={control}
            name="compliant"
            label="Overall compliant"
            description="Check if the employee is fully PPE-compliant for this shift."
          />

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Record Check-in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
