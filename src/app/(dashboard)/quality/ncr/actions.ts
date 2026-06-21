"use server";

import type { NCRStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { createNcr, setNcrStatus, updateNcr } from "@/lib/services/quality";
import { requireUser } from "@/lib/session";
import { ncrSchema, type NcrInput } from "@/lib/validations/quality";

export async function createNcrAction(input: NcrInput) {
  const user = await requireUser();
  const parsed = ncrSchema.parse(input);
  await createNcr(user, parsed);
  revalidatePath("/quality/ncr");
}

export async function updateNcrAction(id: string, input: NcrInput) {
  const user = await requireUser();
  const parsed = ncrSchema.parse(input);
  await updateNcr(user, id, parsed);
  revalidatePath("/quality/ncr");
}

export async function setNcrStatusAction(id: string, status: NCRStatus) {
  const user = await requireUser();
  await setNcrStatus(user, id, status);
  revalidatePath("/quality/ncr");
}
