"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createUserAction } from "@/app/(dashboard)/admin/users/actions";
import { ROLE_LABELS } from "@/components/layout/nav-config";
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
import { SelectFormField, TextFormField } from "@/components/shared/form-fields";
import { ROLE_VALUES, createUserSchema, type CreateUserInput } from "@/lib/validations/admin";

const ROLE_OPTIONS = ROLE_VALUES.map((r) => ({ label: ROLE_LABELS[r] ?? r, value: r }));

export function UserFormDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "PRODUCTION_MANAGER" },
  });

  function onSubmit(values: CreateUserInput) {
    startTransition(async () => {
      try {
        await createUserAction(values);
        toast.success("User created.");
        reset();
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not create user.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>Create a staff account and assign a role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Full Name" required />
            <TextFormField control={control} name="email" type="email" label="Email" required />
            <TextFormField control={control} name="password" type="password" label="Temporary Password" required />
            <SelectFormField control={control} name="role" label="Role" options={ROLE_OPTIONS} required />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
