"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createChecklistAction } from "@/app/(dashboard)/safety/checklists/actions";
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
  TextFormField,
} from "@/components/shared/form-fields";
import { createChecklistSchema, type CreateChecklistInput } from "@/lib/validations/safety";

const DEFAULT_ITEMS = [
  { item: "Fire extinguishers in place", checked: false, remarks: "" },
  { item: "Emergency exits clear", checked: false, remarks: "" },
  { item: "Spill kits stocked", checked: false, remarks: "" },
  { item: "PPE station stocked", checked: false, remarks: "" },
];

export function ChecklistFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset, watch } = useForm<CreateChecklistInput>({
    resolver: zodResolver(createChecklistSchema),
    defaultValues: {
      date: new Date(),
      shift: "",
      items: DEFAULT_ITEMS,
      status: "OK",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  function onSubmit(values: CreateChecklistInput) {
    const status = values.items.every((i) => i.checked) ? "OK" : "ISSUES_FOUND";
    startTransition(async () => {
      try {
        await createChecklistAction({ ...values, status });
        toast.success("Checklist submitted.");
        reset({ date: new Date(), shift: "", items: DEFAULT_ITEMS, status: "OK" });
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Daily Safety Checklist</DialogTitle>
          <DialogDescription>Record the pre-shift safety walkthrough.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateFormField control={control} name="date" label="Date" required />
              <TextFormField control={control} name="shift" label="Shift" placeholder="Morning" />
            </div>
          </FieldGroup>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Checklist Items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ item: "", checked: false, remarks: "" })}
              >
                <Plus className="size-4" /> Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-md border p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <TextFormField
                      control={control}
                      name={`items.${index}.item`}
                      label="Item"
                      required
                    />
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
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <CheckboxFormField
                      control={control}
                      name={`items.${index}.checked`}
                      label="Checked"
                    />
                    <TextFormField
                      control={control}
                      name={`items.${index}.remarks`}
                      label="Remarks"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Status will be recorded as{" "}
              <strong>{items?.every((i) => i.checked) ? "OK" : "ISSUES FOUND"}</strong> based on the
              checked items above.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Submit Checklist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
