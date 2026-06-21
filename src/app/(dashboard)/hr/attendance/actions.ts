"use server";

import { revalidatePath } from "next/cache";

import { createAttendance, DuplicateRecordError, updateAttendance } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";
import { attendanceSchema, type AttendanceInput } from "@/lib/validations/hr";

export async function createAttendanceAction(input: AttendanceInput) {
  const user = await requireUser();
  const parsed = attendanceSchema.parse(input);
  try {
    await createAttendance(user, parsed);
  } catch (err) {
    if (err instanceof DuplicateRecordError) throw new Error(err.message);
    throw err;
  }
  revalidatePath("/hr/attendance");
}

export async function updateAttendanceAction(id: string, input: AttendanceInput) {
  const user = await requireUser();
  const parsed = attendanceSchema.parse(input);
  try {
    await updateAttendance(user, id, parsed);
  } catch (err) {
    if (err instanceof DuplicateRecordError) throw new Error(err.message);
    throw err;
  }
  revalidatePath("/hr/attendance");
}
