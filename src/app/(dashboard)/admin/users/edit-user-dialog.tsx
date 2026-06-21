"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetUserPasswordAction, updateUserAction } from "@/app/(dashboard)/admin/users/actions";
import { ROLE_LABELS } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FieldGroup } from "@/components/ui/field";
import {
  CheckboxFormField,
  SelectFormField,
  TextFormField,
} from "@/components/shared/form-fields";
import {
  ROLE_VALUES,
  resetPasswordSchema,
  updateUserSchema,
  type ResetPasswordInput,
  type UpdateUserInput,
} from "@/lib/validations/admin";

const ROLE_OPTIONS = ROLE_VALUES.map((r) => ({ label: ROLE_LABELS[r] ?? r, value: r }));

type User = { id: string; name: string; email: string; role: string; isActive: boolean };

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isResetPending, startResetTransition] = useTransition();

  const { control, handleSubmit } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, role: user.role as UpdateUserInput["role"], isActive: user.isActive },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  function onSubmit(values: UpdateUserInput) {
    startTransition(async () => {
      try {
        await updateUserAction(user.id, values);
        toast.success("User updated.");
        onOpenChange(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update user.");
      }
    });
  }

  function onResetSubmit(values: ResetPasswordInput) {
    startResetTransition(async () => {
      try {
        await resetUserPasswordAction(user.id, values);
        toast.success("Password reset.");
        resetResetForm();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not reset password.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Full Name" required />
            <SelectFormField control={control} name="role" label="Role" options={ROLE_OPTIONS} required />
            <CheckboxFormField control={control} name="isActive" label="Account active" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>

        <Separator />

        <form onSubmit={handleResetSubmit(onResetSubmit)} noValidate>
          <FieldGroup>
            <TextFormField
              control={resetControl}
              name="password"
              type="password"
              label="Reset Password"
              placeholder="New temporary password"
              required
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" variant="outline" disabled={isResetPending}>
              {isResetPending && <Loader2 className="size-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
