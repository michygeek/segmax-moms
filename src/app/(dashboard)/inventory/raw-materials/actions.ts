"use server";

import { revalidatePath } from "next/cache";

import { createRawMaterial, updateRawMaterial } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";
import { rawMaterialSchema, type RawMaterialInput } from "@/lib/validations/inventory";

export async function createRawMaterialAction(input: RawMaterialInput) {
  const user = await requireUser();
  const parsed = rawMaterialSchema.parse(input);
  await createRawMaterial(user, parsed);
  revalidatePath("/inventory/raw-materials");
}

export async function updateRawMaterialAction(id: string, input: RawMaterialInput) {
  const user = await requireUser();
  const parsed = rawMaterialSchema.parse(input);
  await updateRawMaterial(user, id, parsed);
  revalidatePath("/inventory/raw-materials");
}
