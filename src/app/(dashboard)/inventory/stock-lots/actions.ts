"use server";

import { revalidatePath } from "next/cache";

import { adjustStockLot, receiveStockLot, uploadStockLotCoa } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";
import {
  adjustStockLotSchema,
  receiveStockLotSchema,
  type AdjustStockLotInput,
  type ReceiveStockLotInput,
} from "@/lib/validations/inventory";

export async function receiveStockLotAction(input: ReceiveStockLotInput) {
  const user = await requireUser();
  const parsed = receiveStockLotSchema.parse(input);
  await receiveStockLot(user, parsed);
  revalidatePath("/inventory/stock-lots");
}

export async function adjustStockLotAction(id: string, input: AdjustStockLotInput) {
  const user = await requireUser();
  const parsed = adjustStockLotSchema.parse(input);
  await adjustStockLot(user, id, parsed);
  revalidatePath("/inventory/stock-lots");
}

export async function uploadStockLotCoaAction(id: string, formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("Select a file to upload.");
  await uploadStockLotCoa(user, id, file);
  revalidatePath("/inventory/stock-lots");
}
