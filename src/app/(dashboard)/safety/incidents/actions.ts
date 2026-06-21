"use server";

import { revalidatePath } from "next/cache";

import { closeIncident, createIncident, startIncidentInvestigation } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";
import { createIncidentSchema, type CreateIncidentInput } from "@/lib/validations/safety";

export async function createIncidentAction(input: CreateIncidentInput) {
  const user = await requireUser();
  const parsed = createIncidentSchema.parse(input);
  await createIncident(user, parsed);
  revalidatePath("/safety/incidents");
}

export async function startIncidentInvestigationAction(id: string) {
  const user = await requireUser();
  await startIncidentInvestigation(user, id);
  revalidatePath("/safety/incidents");
}

export async function closeIncidentAction(id: string) {
  const user = await requireUser();
  await closeIncident(user, id);
  revalidatePath("/safety/incidents");
}
