"use server";

import type { BatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  consumeBatchMaterials,
  createBatch,
  transitionBatch,
} from "@/lib/services/production";
import { requireUser } from "@/lib/session";
import {
  consumeMaterialsSchema,
  createBatchSchema,
  type ConsumeMaterialsInput,
  type CreateBatchInput,
} from "@/lib/validations/production";

export async function createBatchAction(input: CreateBatchInput) {
  const user = await requireUser();
  const parsed = createBatchSchema.parse(input);
  const batch = await createBatch(user, parsed);
  revalidatePath("/production/batches");
  redirect(`/production/batches/${batch.id}`);
}

export async function transitionBatchAction(batchId: string, toStatus: BatchStatus, note?: string) {
  const user = await requireUser();
  await transitionBatch(user, batchId, toStatus, note);
  revalidatePath(`/production/batches/${batchId}`);
  revalidatePath("/production/batches");
}

export async function consumeMaterialsAction(batchId: string, input: ConsumeMaterialsInput) {
  const user = await requireUser();
  const parsed = consumeMaterialsSchema.parse(input);
  await consumeBatchMaterials(user, batchId, parsed.consumptions);
  revalidatePath(`/production/batches/${batchId}`);
}
