import type { Role } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { notifyRoles } from "@/lib/notify";
import { assertWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type {
  CreateChecklistInput,
  CreateCorrectiveActionInput,
  CreateDrillInput,
  CreateIncidentInput,
  CreateLotoInput,
  CreatePermitInput,
  CreatePpeCheckinInput,
} from "@/lib/validations/safety";

type Actor = { id: string; role: Role };

// ── Daily Safety Checklists ────────────────────────────────────────────────

export async function listChecklists() {
  return prisma.safetyChecklist.findMany({
    orderBy: { date: "desc" },
    include: { checkedBy: { select: { name: true } } },
  });
}

export async function createChecklist(actor: Actor, input: CreateChecklistInput) {
  assertWrite(actor.role, "safety");

  const checklist = await prisma.safetyChecklist.create({
    data: {
      date: input.date,
      shift: input.shift,
      items: input.items,
      status: input.status,
      checkedById: actor.id,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "SafetyChecklist",
    entityId: checklist.id,
  });
  return checklist;
}

// ── PPE Check-ins (context: SAFETY) ────────────────────────────────────────

export async function listActiveEmployees() {
  return prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
  });
}

export async function listPpeCheckins() {
  return prisma.ppeRecord.findMany({
    where: { context: "SAFETY" },
    orderBy: { checkDate: "desc" },
    include: {
      employee: { select: { fullName: true } },
      checkedBy: { select: { name: true } },
    },
  });
}

export async function createPpeCheckin(actor: Actor, input: CreatePpeCheckinInput) {
  assertWrite(actor.role, "safety");

  const record = await prisma.ppeRecord.create({
    data: {
      employeeId: input.employeeId,
      context: "SAFETY",
      checkDate: input.checkDate,
      items: input.items,
      compliant: input.compliant,
      checkedById: actor.id,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "PpeRecord",
    entityId: record.id,
  });
  return record;
}

// ── Hot Work Permits ───────────────────────────────────────────────────────

export async function listPermits() {
  return prisma.hotWorkPermit.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  });
}

export async function createPermit(actor: Actor, input: CreatePermitInput) {
  assertWrite(actor.role, "safety");

  const permit = await prisma.hotWorkPermit.create({
    data: {
      location: input.location,
      description: input.description,
      validFrom: input.validFrom,
      validTo: input.validTo,
      requestedById: actor.id,
      status: "REQUESTED",
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "HotWorkPermit",
    entityId: permit.id,
  });
  return permit;
}

export async function approvePermit(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const permit = await prisma.hotWorkPermit.update({
    where: { id },
    data: { status: "APPROVED", approvedById: actor.id },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "HotWorkPermit",
    entityId: id,
    changes: { to: "APPROVED" },
  });
  return permit;
}

export async function rejectPermit(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const permit = await prisma.hotWorkPermit.update({
    where: { id },
    data: { status: "REJECTED", approvedById: actor.id },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "HotWorkPermit",
    entityId: id,
    changes: { to: "REJECTED" },
  });
  return permit;
}

export async function closePermit(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const permit = await prisma.hotWorkPermit.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "HotWorkPermit",
    entityId: id,
    changes: { to: "CLOSED" },
  });
  return permit;
}

// ── Lock Out / Tag Out ─────────────────────────────────────────────────────

export async function listLotos() {
  return prisma.lockOutTagOut.findMany({
    orderBy: { lockedAt: "desc" },
    include: {
      lockedBy: { select: { name: true } },
      unlockedBy: { select: { name: true } },
    },
  });
}

export async function createLoto(actor: Actor, input: CreateLotoInput) {
  assertWrite(actor.role, "safety");

  const loto = await prisma.lockOutTagOut.create({
    data: {
      equipment: input.equipment,
      reason: input.reason,
      lockedById: actor.id,
      lockedAt: new Date(),
      status: "LOCKED",
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "LockOutTagOut",
    entityId: loto.id,
  });
  return loto;
}

export async function unlockLoto(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const loto = await prisma.lockOutTagOut.update({
    where: { id },
    data: { status: "UNLOCKED", unlockedById: actor.id, unlockedAt: new Date() },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "LockOutTagOut",
    entityId: id,
    changes: { to: "UNLOCKED" },
  });
  return loto;
}

// ── Safety Incidents ───────────────────────────────────────────────────────

export async function listIncidents() {
  return prisma.safetyIncident.findMany({
    orderBy: { createdAt: "desc" },
    include: { reportedBy: { select: { name: true } } },
  });
}

export async function createIncident(actor: Actor, input: CreateIncidentInput) {
  assertWrite(actor.role, "safety");

  const incident = await prisma.safetyIncident.create({
    data: {
      type: input.type,
      description: input.description,
      location: input.location,
      severity: input.severity,
      status: "REPORTED",
      reportedById: actor.id,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "SafetyIncident",
    entityId: incident.id,
  });

  if (input.severity === "HIGH" || input.severity === "CRITICAL") {
    await notifyRoles({
      roles: ["SAFETY_OFFICER", "CEO", "SUPER_ADMIN"],
      title: "High-severity safety incident",
      message: `A ${input.severity.toLowerCase()} severity ${input.type.toLowerCase()} incident was reported${
        input.location ? ` at ${input.location}` : ""
      }.`,
      type: "ERROR",
      link: "/safety/incidents",
    });
  }

  return incident;
}

export async function startIncidentInvestigation(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const incident = await prisma.safetyIncident.update({
    where: { id },
    data: { status: "INVESTIGATING" },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "SafetyIncident",
    entityId: id,
    changes: { to: "INVESTIGATING" },
  });
  return incident;
}

export async function closeIncident(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const incident = await prisma.safetyIncident.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "SafetyIncident",
    entityId: id,
    changes: { to: "CLOSED" },
  });
  return incident;
}

// ── Corrective Actions ─────────────────────────────────────────────────────

export async function listCorrectiveActions() {
  return prisma.correctiveAction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { name: true } },
      incident: { select: { id: true, description: true } },
      ncr: { select: { id: true, description: true } },
    },
  });
}

export async function listOpenIncidentsForLinking() {
  return prisma.safetyIncident.findMany({
    where: { status: { not: "CLOSED" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, description: true },
  });
}

export async function listOpenNcrsForLinking() {
  return prisma.nonConformanceReport.findMany({
    where: { status: { not: "CLOSED" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, description: true },
  });
}

export async function listAssignableUsers() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createCorrectiveAction(actor: Actor, input: CreateCorrectiveActionInput) {
  assertWrite(actor.role, "safety");

  const action = await prisma.correctiveAction.create({
    data: {
      description: input.description,
      assignedToId: input.assignedToId,
      dueDate: input.dueDate ?? null,
      status: input.status,
      incidentId: input.linkType === "INCIDENT" ? input.incidentId : null,
      ncrId: input.linkType === "NCR" ? input.ncrId : null,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "CorrectiveAction",
    entityId: action.id,
  });
  return action;
}

export async function completeCorrectiveAction(actor: Actor, id: string) {
  assertWrite(actor.role, "safety");

  const action = await prisma.correctiveAction.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "CorrectiveAction",
    entityId: id,
    changes: { to: "COMPLETED" },
  });
  return action;
}

// ── Safety Drill Records ───────────────────────────────────────────────────

export async function listDrills() {
  return prisma.safetyDrillRecord.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { conductedBy: { select: { name: true } } },
  });
}

export async function createDrill(actor: Actor, input: CreateDrillInput) {
  assertWrite(actor.role, "safety");

  const drill = await prisma.safetyDrillRecord.create({
    data: {
      month: input.month,
      year: input.year,
      type: input.type,
      attendees: input.attendees,
      notes: input.notes,
      conductedById: actor.id,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "SafetyDrillRecord",
    entityId: drill.id,
  });
  return drill;
}
