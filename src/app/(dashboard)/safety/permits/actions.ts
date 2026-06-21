"use server";

import { revalidatePath } from "next/cache";

import { approvePermit, closePermit, createPermit, rejectPermit } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import { createPermitSchema, type CreatePermitInput } from "@/lib/validations/safety";

export async function createPermitAction(input: CreatePermitInput) {
  const user = await requireUser();
  const parsed = createPermitSchema.parse(input);
  await createPermit(user, parsed);
  revalidatePath("/safety/permits");
}

export async function approvePermitAction(id: string) {
  const user = await requireUser();
  await approvePermit(user, id);
  revalidatePath("/safety/permits");
}

export async function rejectPermitAction(id: string) {
  const user = await requireUser();
  await rejectPermit(user, id);
  revalidatePath("/safety/permits");
}

export async function closePermitAction(id: string) {
  const user = await requireUser();
  await closePermit(user, id);
  revalidatePath("/safety/permits");
}
