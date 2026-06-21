"use server";

import { revalidatePath } from "next/cache";

import { createPpeCheckin } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import { createPpeCheckinSchema, type CreatePpeCheckinInput } from "@/lib/validations/safety";

export async function createPpeCheckinAction(input: CreatePpeCheckinInput) {
  const user = await requireUser();
  const parsed = createPpeCheckinSchema.parse(input);
  await createPpeCheckin(user, parsed);
  revalidatePath("/safety/ppe-checkins");
}
