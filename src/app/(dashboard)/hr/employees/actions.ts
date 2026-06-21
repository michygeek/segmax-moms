"use server";

import { revalidatePath } from "next/cache";

import { createEmployee, deactivateEmployee, updateEmployee } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";
import { employeeSchema, type EmployeeInput } from "@/lib/validations/hr";

export async function createEmployeeAction(input: EmployeeInput) {
  const user = await requireUser();
  const parsed = employeeSchema.parse(input);
  await createEmployee(user, parsed);
  revalidatePath("/hr/employees");
}

export async function updateEmployeeAction(id: string, input: EmployeeInput) {
  const user = await requireUser();
  const parsed = employeeSchema.parse(input);
  await updateEmployee(user, id, parsed);
  revalidatePath("/hr/employees");
}

export async function deactivateEmployeeAction(id: string) {
  const user = await requireUser();
  await deactivateEmployee(user, id);
  revalidatePath("/hr/employees");
}
