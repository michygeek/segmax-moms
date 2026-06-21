"use server";

import { revalidatePath } from "next/cache";

import {
  createTrainingRecord,
  deleteTrainingRecord,
  updateTrainingRecord,
  uploadTrainingCertificate,
} from "@/lib/services/hr";
import { requireUser } from "@/lib/session";
import { trainingRecordSchema, type TrainingRecordInput } from "@/lib/validations/hr";

export async function createTrainingRecordAction(input: TrainingRecordInput) {
  const user = await requireUser();
  const parsed = trainingRecordSchema.parse(input);
  const record = await createTrainingRecord(user, parsed);
  revalidatePath("/hr/training");
  return record;
}

export async function updateTrainingRecordAction(id: string, input: TrainingRecordInput) {
  const user = await requireUser();
  const parsed = trainingRecordSchema.parse(input);
  await updateTrainingRecord(user, id, parsed);
  revalidatePath("/hr/training");
}

export async function deleteTrainingRecordAction(id: string) {
  const user = await requireUser();
  await deleteTrainingRecord(user, id);
  revalidatePath("/hr/training");
}

export async function uploadTrainingCertificateAction(id: string, formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("Select a file to upload.");
  await uploadTrainingCertificate(user, id, file);
  revalidatePath("/hr/training");
}
