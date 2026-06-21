"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createLotoAction } from "@/app/(dashboard)/safety/lotos/actions";
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
import { TextareaFormField, TextFormField } from "@/components/shared/form-fields";
import { createLotoSchema, type CreateLotoInput } from "@/lib/validations/safety";

export function LotoFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CreateLotoInput>({
    resolver: zodResolver(createLotoSchema),
    defaultValues: {
      equipment: "",
      reason: "",
    },
  });

  function onSubmit(values: CreateLotoInput) {
    startTransition(async () => {
      try {
        await createLotoAction(values);
        toast.success("Equipment locked out.");
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
          <DialogTitle>New Lock Out / Tag Out</DialogTitle>
          <DialogDescription>Record an equipment lockout for maintenance or safety.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="equipment" label="Equipment" required />
            <TextareaFormField control={control} name="reason" label="Reason" required />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Lock Out
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
