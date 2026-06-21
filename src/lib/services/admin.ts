import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { writeAuditLog } from "@/lib/audit";
import { assertWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/admin";

type Actor = { id: string; role: Role };

export class DuplicateEmailError extends Error {
  constructor() {
    super("A user with this email already exists.");
  }
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
}

export async function createUser(actor: Actor, input: CreateUserInput) {
  assertWrite(actor.role, "admin");

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new DuplicateEmailError();

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, role: input.role, passwordHash },
  });

  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "User", entityId: user.id });
  return user;
}

export async function updateUser(actor: Actor, id: string, input: UpdateUserInput) {
  assertWrite(actor.role, "admin");

  if (actor.id === id && input.isActive === false) {
    throw new Error("You cannot deactivate your own account.");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name: input.name, role: input.role, isActive: input.isActive },
  });

  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "User", entityId: id, changes: input });
  return user;
}

export async function resetUserPassword(actor: Actor, id: string, password: string) {
  assertWrite(actor.role, "admin");
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "User", entityId: id, changes: { passwordReset: true } });
}

export async function listAuditLog(take = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true, email: true, role: true } } },
  });
}
