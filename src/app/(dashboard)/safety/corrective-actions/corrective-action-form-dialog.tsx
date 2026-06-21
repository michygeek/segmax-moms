"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createCorrectiveActionAction } from "@/app/(dashboard)/safety/corrective-actions/actions";
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
import {
  CORRECTIVE_ACTION_STATUS_VALUES,
  createCorrectiveActionSchema,
  type CreateCorrectiveActionInput,
} from "@/lib/validations/safety";

type UserOption = { id: string; name: string };
type LinkOption = { id: string; description: string };

const STATUS_OPTIONS = CORRECTIVE_ACTION_STATUS_VALUES.map((v) => ({
  label: v.replaceAll("_", " "),
  value: v,
}));

const LINK_TYPE_OPTIONS = [
  { label: "None", value: "NONE" },
  { label: "Safety Incident", value: "INCIDENT" },
  { label: "Non-Conformance Report", value: "NCR" },
];

export function CorrectiveActionFormDialog({
  users,
  incidents,
  ncrs,
  trigger,
}: {
  users: UserOption[];
  incidents: LinkOption[];
  ncrs: LinkOption[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CreateCorrectiveActionInput>({
    resolver: zodResolver(createCorrectiveActionSchema),
    defaultValues: {
      description: "",
      assignedToId: "",
      dueDate: null,
      status: "OPEN",
      linkType: "NONE",
      incidentId: "",
      ncrId: "",
    },
  });

  const linkType = useWatch({ control, name: "linkType" });

  function onSubmit(values: CreateCorrectiveActionInput) {
    startTransition(async () => {
      try {
        await createCorrectiveActionAction(values);
        toast.success("Corrective action created.");
        reset();
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const userOptions = users.map((u) => ({ label: u.name, value: u.id }));
  const incidentOptions = incidents.map((i) => ({
    label: i.description.slice(0, 60),
    value: i.id,
  }));
  const ncrOptions = ncrs.map((n) => ({ label: n.description.slice(0, 60), value: n.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Corrective Action</DialogTitle>
          <DialogDescription>
            Assign a corrective action, optionally linked to an incident or NCR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextareaFormField control={control} name="description" label="Description" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectFormField
                control={control}
                name="assignedToId"
                label="Assigned To"
                options={userOptions}
                required
              />
              <DateFormField control={control} name="dueDate" label="Due Date" />
            </div>
            <SelectFormField control={control} name="status" label="Status" options={STATUS_OPTIONS} required />
            <SelectFormField
              control={control}
              name="linkType"
              label="Link To"
              options={LINK_TYPE_OPTIONS}
            />
            {linkType === "INCIDENT" && (
              <SelectFormField
                control={control}
                name="incidentId"
                label="Safety Incident"
                options={incidentOptions}
                placeholder="Select an open incident…"
              />
            )}
            {linkType === "NCR" && (
              <SelectFormField
                control={control}
                name="ncrId"
                label="Non-Conformance Report"
                options={ncrOptions}
                placeholder="Select an open NCR…"
              />
            )}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create Corrective Action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
