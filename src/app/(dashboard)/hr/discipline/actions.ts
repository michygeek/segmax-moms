"use server";

import { revalidatePath } from "next/cache";

import { createDisciplineLog, deleteDisciplineLog, updateDisciplineLog } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";
import { disciplineLogSchema, type DisciplineLogInput } from "@/lib/validations/hr";

export async function createDisciplineLogAction(input: DisciplineLogInput) {
  const user = await requireUser();
  const parsed = disciplineLogSchema.parse(input);
  await createDisciplineLog(user, parsed);
  revalidatePath("/hr/discipline");
}

export async function updateDisciplineLogAction(id: string, input: DisciplineLogInput) {
  const user = await requireUser();
  const parsed = disciplineLogSchema.parse(input);
  await updateDisciplineLog(user, id, parsed);
  revalidatePath("/hr/discipline");
}

export async function deleteDisciplineLogAction(id: string) {
  const user = await requireUser();
  await deleteDisciplineLog(user, id);
  revalidatePath("/hr/discipline");
}
