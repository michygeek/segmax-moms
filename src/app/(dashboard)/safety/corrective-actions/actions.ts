"use server";

import { revalidatePath } from "next/cache";

import { completeCorrectiveAction, createCorrectiveAction } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import {
  createCorrectiveActionSchema,
  type CreateCorrectiveActionInput,
} from "@/lib/validations/safety";

export async function createCorrectiveActionAction(input: CreateCorrectiveActionInput) {
  const user = await requireUser();
  const parsed = createCorrectiveActionSchema.parse(input);
  await createCorrectiveAction(user, parsed);
  revalidatePath("/safety/corrective-actions");
}

export async function completeCorrectiveActionAction(id: string) {
  const user = await requireUser();
  await completeCorrectiveAction(user, id);
  revalidatePath("/safety/corrective-actions");
}
