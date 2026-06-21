"use server";

import { revalidatePath } from "next/cache";

import { archiveProduct, createProduct, updateProduct } from "@/lib/services/production";
import { requireUser } from "@/lib/session";
import { productSchema, type ProductInput } from "@/lib/validations/production";

export async function createProductAction(input: ProductInput) {
  const user = await requireUser();
  const parsed = productSchema.parse(input);
  await createProduct(user, parsed);
  revalidatePath("/production/products");
}

export async function updateProductAction(id: string, input: ProductInput) {
  const user = await requireUser();
  const parsed = productSchema.parse(input);
  await updateProduct(user, id, parsed);
  revalidatePath("/production/products");
}

export async function archiveProductAction(id: string) {
  const user = await requireUser();
  await archiveProduct(user, id);
  revalidatePath("/production/products");
}
