import { prisma } from "@/lib/prisma";
import type { NotificationType, Role } from "@prisma/client";

export async function notifyUser(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      link: params.link,
    },
  });
}

/** Notify every active user holding one of the given roles. */
export async function notifyRoles(params: {
  roles: Role[];
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  const users = await prisma.user.findMany({
    where: { role: { in: params.roles }, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      link: params.link,
    })),
  });
}
