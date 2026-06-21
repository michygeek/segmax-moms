"use server";

import { revalidatePath } from "next/cache";

import {
  createRetentionSample,
  disposeRetentionSample,
  updateRetentionSample,
} from "@/lib/services/quality";
import { requireUser } from "@/lib/session";
import { retentionSampleSchema, type RetentionSampleInput } from "@/lib/validations/quality";

export async function createRetentionSampleAction(input: RetentionSampleInput) {
  const user = await requireUser();
  const parsed = retentionSampleSchema.parse(input);
  await createRetentionSample(user, parsed);
  revalidatePath("/quality/retention-samples");
}

export async function updateRetentionSampleAction(id: string, input: RetentionSampleInput) {
  const user = await requireUser();
  const parsed = retentionSampleSchema.parse(input);
  await updateRetentionSample(user, id, parsed);
  revalidatePath("/quality/retention-samples");
}

export async function disposeRetentionSampleAction(id: string) {
  const user = await requireUser();
  await disposeRetentionSample(user, id);
  revalidatePath("/quality/retention-samples");
}
