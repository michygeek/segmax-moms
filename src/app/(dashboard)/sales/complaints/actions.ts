"use server";

import { revalidatePath } from "next/cache";

import { createComplaint, resolveComplaint, updateComplaint } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";
import { complaintSchema, type ComplaintInput } from "@/lib/validations/sales";

export async function createComplaintAction(input: ComplaintInput) {
  const user = await requireUser();
  const parsed = complaintSchema.parse(input);
  await createComplaint(user, parsed);
  revalidatePath("/sales/complaints");
}

export async function updateComplaintAction(id: string, input: ComplaintInput) {
  const user = await requireUser();
  const parsed = complaintSchema.parse(input);
  await updateComplaint(user, id, parsed);
  revalidatePath("/sales/complaints");
}

export async function resolveComplaintAction(id: string, resolution: string) {
  const user = await requireUser();
  await resolveComplaint(user, id, resolution);
  revalidatePath("/sales/complaints");
}
