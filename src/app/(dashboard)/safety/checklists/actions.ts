"use server";

import { revalidatePath } from "next/cache";

import { createChecklist } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import { createChecklistSchema, type CreateChecklistInput } from "@/lib/validations/safety";

export async function createChecklistAction(input: CreateChecklistInput) {
  const user = await requireUser();
  const parsed = createChecklistSchema.parse(input);
  await createChecklist(user, parsed);
  revalidatePath("/safety/checklists");
}
