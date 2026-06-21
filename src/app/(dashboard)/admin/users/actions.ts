"use server";

import { revalidatePath } from "next/cache";

import { createUser, resetUserPassword, updateUser } from "@/lib/services/admin";
import { requireUser } from "@/lib/session";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  type CreateUserInput,
  type ResetPasswordInput,
  type UpdateUserInput,
} from "@/lib/validations/admin";

export async function createUserAction(input: CreateUserInput) {
  const actor = await requireUser();
  const parsed = createUserSchema.parse(input);
  await createUser(actor, parsed);
  revalidatePath("/admin/users");
}

export async function updateUserAction(id: string, input: UpdateUserInput) {
  const actor = await requireUser();
  const parsed = updateUserSchema.parse(input);
  await updateUser(actor, id, parsed);
  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(id: string, input: ResetPasswordInput) {
  const actor = await requireUser();
  const parsed = resetPasswordSchema.parse(input);
  await resetUserPassword(actor, id, parsed.password);
  revalidatePath("/admin/users");
}
