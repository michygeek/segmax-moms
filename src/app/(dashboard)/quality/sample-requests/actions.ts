"use server";

import { revalidatePath } from "next/cache";

import { submitLabTestAndRelease } from "@/lib/services/quality";
import { requireUser } from "@/lib/session";
import { submitLabTestSchema, type SubmitLabTestInput } from "@/lib/validations/quality";

export async function submitLabTestAction(sampleRequestId: string, input: SubmitLabTestInput) {
  const user = await requireUser();
  const parsed = submitLabTestSchema.parse(input);
  await submitLabTestAndRelease(user, sampleRequestId, parsed);
  revalidatePath("/quality/sample-requests");
  revalidatePath(`/quality/sample-requests/${sampleRequestId}`);
  revalidatePath("/production/batches");
}
