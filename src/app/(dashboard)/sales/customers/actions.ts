"use server";

import { revalidatePath } from "next/cache";

import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";
import { customerSchema, type CustomerInput } from "@/lib/validations/sales";

export async function createCustomerAction(input: CustomerInput) {
  const user = await requireUser();
  const parsed = customerSchema.parse(input);
  await createCustomer(user, parsed);
  revalidatePath("/sales/customers");
}

export async function updateCustomerAction(id: string, input: CustomerInput) {
  const user = await requireUser();
  const parsed = customerSchema.parse(input);
  await updateCustomer(user, id, parsed);
  revalidatePath("/sales/customers");
}

export async function deleteCustomerAction(id: string) {
  const user = await requireUser();
  await deleteCustomer(user, id);
  revalidatePath("/sales/customers");
}
