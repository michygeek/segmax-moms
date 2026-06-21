"use server";

import { revalidatePath } from "next/cache";

import { createLoto, unlockLoto } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import { createLotoSchema, type CreateLotoInput } from "@/lib/validations/safety";

export async function createLotoAction(input: CreateLotoInput) {
  const user = await requireUser();
  const parsed = createLotoSchema.parse(input);
  await createLoto(user, parsed);
  revalidatePath("/safety/lotos");
}

export async function unlockLotoAction(id: string) {
  const user = await requireUser();
  await unlockLoto(user, id);
  revalidatePath("/safety/lotos");
}
