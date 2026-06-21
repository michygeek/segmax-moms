"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createIncidentAction } from "@/app/(dashboard)/safety/incidents/actions";
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
import { SelectFormField, TextareaFormField, TextFormField } from "@/components/shared/form-fields";
import {
  createIncidentSchema,
  INCIDENT_SEVERITY_VALUES,
  INCIDENT_TYPE_VALUES,
  type CreateIncidentInput,
} from "@/lib/validations/safety";

const TYPE_OPTIONS = INCIDENT_TYPE_VALUES.map((v) => ({ label: v.replaceAll("_", " "), value: v }));
const SEVERITY_OPTIONS = INCIDENT_SEVERITY_VALUES.map((v) => ({ label: v, value: v }));

export function IncidentFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      type: "NEAR_MISS",
      description: "",
      location: "",
      severity: "LOW",
    },
  });

  function onSubmit(values: CreateIncidentInput) {
    startTransition(async () => {
      try {
        await createIncidentAction(values);
        toast.success("Incident reported.");
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
          <DialogTitle>Report Safety Incident</DialogTitle>
          <DialogDescription>Record a new safety incident, spill, injury, or near miss.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectFormField control={control} name="type" label="Type" options={TYPE_OPTIONS} required />
              <SelectFormField
                control={control}
                name="severity"
                label="Severity"
                options={SEVERITY_OPTIONS}
                required
              />
            </div>
            <TextFormField control={control} name="location" label="Location" placeholder="Filling line 2" />
            <TextareaFormField control={control} name="description" label="Description" required />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Report Incident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
