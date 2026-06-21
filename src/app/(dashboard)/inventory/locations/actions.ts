"use server";

import { revalidatePath } from "next/cache";

import { createStorageLocation, updateStorageLocation } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";
import { storageLocationSchema, type StorageLocationInput } from "@/lib/validations/inventory";

export async function createStorageLocationAction(input: StorageLocationInput) {
  const user = await requireUser();
  const parsed = storageLocationSchema.parse(input);
  await createStorageLocation(user, parsed);
  revalidatePath("/inventory/locations");
}

export async function updateStorageLocationAction(id: string, input: StorageLocationInput) {
  const user = await requireUser();
  const parsed = storageLocationSchema.parse(input);
  await updateStorageLocation(user, id, parsed);
  revalidatePath("/inventory/locations");
}
