"use server";

import { revalidatePath } from "next/cache";

import { createDrill } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import { createDrillSchema, type CreateDrillInput } from "@/lib/validations/safety";

export async function createDrillAction(input: CreateDrillInput) {
  const user = await requireUser();
  const parsed = createDrillSchema.parse(input);
  await createDrill(user, parsed);
  revalidatePath("/safety/drills");
}
