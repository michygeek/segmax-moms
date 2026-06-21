"use server";

import { revalidatePath } from "next/cache";

import {
  createShift,
  createShiftAssignment,
  deleteShift,
  DuplicateRecordError,
  updateShift,
} from "@/lib/services/hr";
import { requireUser } from "@/lib/session";
import { shiftAssignmentSchema, shiftSchema, type ShiftAssignmentInput, type ShiftInput } from "@/lib/validations/hr";

export async function createShiftAction(input: ShiftInput) {
  const user = await requireUser();
  const parsed = shiftSchema.parse(input);
  await createShift(user, parsed);
  revalidatePath("/hr/shifts");
}

export async function updateShiftAction(id: string, input: ShiftInput) {
  const user = await requireUser();
  const parsed = shiftSchema.parse(input);
  await updateShift(user, id, parsed);
  revalidatePath("/hr/shifts");
}

export async function deleteShiftAction(id: string) {
  const user = await requireUser();
  await deleteShift(user, id);
  revalidatePath("/hr/shifts");
}

export async function createShiftAssignmentAction(input: ShiftAssignmentInput) {
  const user = await requireUser();
  const parsed = shiftAssignmentSchema.parse(input);
  try {
    await createShiftAssignment(user, parsed);
  } catch (err) {
    if (err instanceof DuplicateRecordError) throw new Error(err.message);
    throw err;
  }
  revalidatePath("/hr/shifts");
}
