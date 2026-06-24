import type { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { assertWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { COA_BUCKET, uploadFile } from "@/lib/supabase";
import type {
  AttendanceInput,
  DisciplineLogInput,
  EmployeeInput,
  ShiftAssignmentInput,
  ShiftInput,
  TrainingRecordInput,
} from "@/lib/validations/hr";

type Actor = { id: string; role: Role };

/** Thrown when a unique-constraint violation (e.g. duplicate attendance/shift assignment) occurs. */
export class DuplicateRecordError extends Error {}

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

// ── Employees ───────────────────────────────────────────────────────────

export async function listEmployees() {
  return prisma.employee.findMany({ orderBy: { fullName: "asc" } });
}

export async function listActiveEmployees() {
  return prisma.employee.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } });
}

export async function getEmployee(id: string) {
  return prisma.employee.findUnique({ where: { id } });
}

export async function createEmployee(actor: Actor, input: EmployeeInput) {
  assertWrite(actor.role, "hr");
  const employee = await prisma.employee.create({ data: input });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "Employee", entityId: employee.id });
  return employee;
}

export async function updateEmployee(actor: Actor, id: string, input: EmployeeInput) {
  assertWrite(actor.role, "hr");
  const employee = await prisma.employee.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Employee", entityId: id, changes: input });
  return employee;
}

export async function deactivateEmployee(actor: Actor, id: string) {
  assertWrite(actor.role, "hr");
  await prisma.employee.update({ where: { id }, data: { isActive: false } });
  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "Employee",
    entityId: id,
    changes: { isActive: false },
  });
}

// ── Attendance ──────────────────────────────────────────────────────────

export async function listAttendance(take = 200) {
  return prisma.attendance.findMany({
    orderBy: { date: "desc" },
    take,
    include: { employee: { select: { fullName: true, employeeCode: true } } },
  });
}

export async function createAttendance(actor: Actor, input: AttendanceInput) {
  assertWrite(actor.role, "hr");
  try {
    const record = await prisma.attendance.create({ data: input });
    await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "Attendance", entityId: record.id });
    return record;
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new DuplicateRecordError("Attendance already recorded for this employee today.");
    }
    throw err;
  }
}

export async function updateAttendance(actor: Actor, id: string, input: AttendanceInput) {
  assertWrite(actor.role, "hr");
  try {
    const record = await prisma.attendance.update({ where: { id }, data: input });
    await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Attendance", entityId: id, changes: input });
    return record;
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new DuplicateRecordError("Attendance already recorded for this employee today.");
    }
    throw err;
  }
}

// ── Shifts ──────────────────────────────────────────────────────────────

export async function listShifts() {
  return prisma.shift.findMany({ orderBy: { name: "asc" } });
}

export async function createShift(actor: Actor, input: ShiftInput) {
  assertWrite(actor.role, "hr");
  const shift = await prisma.shift.create({ data: input });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "Shift", entityId: shift.id });
  return shift;
}

export async function updateShift(actor: Actor, id: string, input: ShiftInput) {
  assertWrite(actor.role, "hr");
  const shift = await prisma.shift.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Shift", entityId: id, changes: input });
  return shift;
}

export async function deleteShift(actor: Actor, id: string) {
  assertWrite(actor.role, "hr");
  await prisma.shift.delete({ where: { id } });
  await writeAuditLog({ userId: actor.id, action: "DELETE", entity: "Shift", entityId: id });
}

export async function listShiftAssignments() {
  return prisma.shiftAssignment.findMany({
    orderBy: { date: "desc" },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
      shift: { select: { name: true, startTime: true, endTime: true } },
    },
  });
}

export async function createShiftAssignment(actor: Actor, input: ShiftAssignmentInput) {
  assertWrite(actor.role, "hr");
  try {
    const assignment = await prisma.shiftAssignment.create({ data: input });
    await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "ShiftAssignment", entityId: assignment.id });
    return assignment;
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new DuplicateRecordError("This employee already has a shift assignment for that date.");
    }
    throw err;
  }
}

// ── Training Records ────────────────────────────────────────────────────

export async function listTrainingRecords() {
  return prisma.trainingRecord.findMany({
    orderBy: { completedDate: "desc" },
    include: { employee: { select: { fullName: true, employeeCode: true } } },
  });
}

export async function getTrainingRecord(id: string) {
  return prisma.trainingRecord.findUnique({ where: { id } });
}

export async function createTrainingRecord(actor: Actor, input: TrainingRecordInput) {
  assertWrite(actor.role, "hr");
  const record = await prisma.trainingRecord.create({ data: input });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "TrainingRecord", entityId: record.id });
  return record;
}

export async function updateTrainingRecord(actor: Actor, id: string, input: TrainingRecordInput) {
  assertWrite(actor.role, "hr");
  const record = await prisma.trainingRecord.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "TrainingRecord", entityId: id, changes: input });
  return record;
}

export async function deleteTrainingRecord(actor: Actor, id: string) {
  assertWrite(actor.role, "hr");
  await prisma.trainingRecord.delete({ where: { id } });
  await writeAuditLog({ userId: actor.id, action: "DELETE", entity: "TrainingRecord", entityId: id });
}

export async function uploadTrainingCertificate(actor: Actor, id: string, file: File) {
  assertWrite(actor.role, "hr");

  const url = await uploadFile({ bucket: COA_BUCKET, path: `training/${id}-${file.name}`, file });

  await prisma.trainingRecord.update({ where: { id }, data: { certificateUrl: url } });
  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "TrainingRecord",
    entityId: id,
    changes: { certificateUrl: url },
  });

  return url;
}

// ── PPE Records (HR context) ───────────────────────────────────────────

export async function listHrPpeRecords() {
  return prisma.ppeRecord.findMany({
    where: { context: "HR" },
    orderBy: { checkDate: "desc" },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
      checkedBy: { select: { name: true } },
    },
  });
}

export async function createHrPpeRecord(
  actor: Actor,
  input: { employeeId: string; checkDate: Date; items: { item: string; compliant: boolean }[]; compliant: boolean }
) {
  assertWrite(actor.role, "hr");
  const record = await prisma.ppeRecord.create({
    data: {
      employeeId: input.employeeId,
      context: "HR",
      checkDate: input.checkDate,
      items: input.items,
      compliant: input.compliant,
      checkedById: actor.id,
    },
  });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "PpeRecord", entityId: record.id });
  return record;
}

// ── Discipline Log ──────────────────────────────────────────────────────

export async function listDisciplineLogs() {
  return prisma.disciplineLog.findMany({
    orderBy: { date: "desc" },
    include: { employee: { select: { fullName: true, employeeCode: true } } },
  });
}

export async function createDisciplineLog(actor: Actor, input: DisciplineLogInput) {
  assertWrite(actor.role, "hr");
  const log = await prisma.disciplineLog.create({
    data: { ...input, recordedById: actor.id },
  });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "DisciplineLog", entityId: log.id });
  return log;
}

export async function updateDisciplineLog(actor: Actor, id: string, input: DisciplineLogInput) {
  assertWrite(actor.role, "hr");
  const log = await prisma.disciplineLog.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "DisciplineLog", entityId: id, changes: input });
  return log;
}

export async function deleteDisciplineLog(actor: Actor, id: string) {
  assertWrite(actor.role, "hr");
  await prisma.disciplineLog.delete({ where: { id } });
  await writeAuditLog({ userId: actor.id, action: "DELETE", entity: "DisciplineLog", entityId: id });
}
