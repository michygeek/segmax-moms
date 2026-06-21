"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPermitAction } from "@/app/(dashboard)/safety/permits/actions";
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
import { DateFormField, TextareaFormField, TextFormField } from "@/components/shared/form-fields";
import { createPermitSchema, type CreatePermitInput } from "@/lib/validations/safety";

export function PermitFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CreatePermitInput>({
    resolver: zodResolver(createPermitSchema),
    defaultValues: {
      location: "",
      description: "",
      validFrom: undefined as unknown as Date,
      validTo: undefined as unknown as Date,
    },
  });

  function onSubmit(values: CreatePermitInput) {
    startTransition(async () => {
      try {
        await createPermitAction(values);
        toast.success("Hot work permit requested.");
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
          <DialogTitle>New Hot Work Permit</DialogTitle>
          <DialogDescription>Request authorization for hot work activity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="location" label="Location" required />
            <TextareaFormField control={control} name="description" label="Description" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <DateFormField control={control} name="validFrom" label="Valid From" required />
              <DateFormField control={control} name="validTo" label="Valid To" required />
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Request Permit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
