"use server";

import { revalidatePath } from "next/cache";

import { createSupplier, updateSupplier } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";
import { supplierSchema, type SupplierInput } from "@/lib/validations/inventory";

export async function createSupplierAction(input: SupplierInput) {
  const user = await requireUser();
  const parsed = supplierSchema.parse(input);
  await createSupplier(user, parsed);
  revalidatePath("/inventory/suppliers");
}

export async function updateSupplierAction(id: string, input: SupplierInput) {
  const user = await requireUser();
  const parsed = supplierSchema.parse(input);
  await updateSupplier(user, id, parsed);
  revalidatePath("/inventory/suppliers");
}
