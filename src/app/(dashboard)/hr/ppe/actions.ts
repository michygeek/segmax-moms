"use server";

import { revalidatePath } from "next/cache";

import { createHrPpeRecord } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";
import { ppeRecordSchema, type PpeRecordInput } from "@/lib/validations/hr";

export async function createHrPpeRecordAction(input: PpeRecordInput) {
  const user = await requireUser();
  const parsed = ppeRecordSchema.parse(input);
  await createHrPpeRecord(user, parsed);
  revalidatePath("/hr/ppe");
}
