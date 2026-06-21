"use server";

import { revalidatePath } from "next/cache";

import { dispatchFinishedGood, transferFinishedGood } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";
import { transferFinishedGoodSchema, type TransferFinishedGoodInput } from "@/lib/validations/inventory";

export async function transferFinishedGoodAction(id: string, input: TransferFinishedGoodInput) {
  const user = await requireUser();
  const parsed = transferFinishedGoodSchema.parse(input);
  await transferFinishedGood(user, id, parsed.storageLocationId);
  revalidatePath("/inventory/finished-goods");
}

export async function dispatchFinishedGoodAction(id: string) {
  const user = await requireUser();
  await dispatchFinishedGood(user, id);
  revalidatePath("/inventory/finished-goods");
}
