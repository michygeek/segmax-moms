import type { OrderStatus, Role } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { notifyRoles } from "@/lib/notify";
import { assertWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/utils";
import type {
  ComplaintInput,
  CreateOrderInput,
  CustomerInput,
  DispatchOrderInput,
  MatchBatchInput,
} from "@/lib/validations/sales";

type Actor = { id: string; role: Role };

// ── Customers ────────────────────────────────────────────────────────────

export async function listCustomers() {
  return prisma.customer.findMany({ orderBy: { name: "asc" } });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function createCustomer(actor: Actor, input: CustomerInput) {
  assertWrite(actor.role, "sales");
  const customer = await prisma.customer.create({
    data: { ...input, email: input.email || undefined, phone: input.phone || undefined },
  });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "Customer", entityId: customer.id });
  return customer;
}

export async function updateCustomer(actor: Actor, id: string, input: CustomerInput) {
  assertWrite(actor.role, "sales");
  const customer = await prisma.customer.update({
    where: { id },
    data: { ...input, email: input.email || undefined, phone: input.phone || undefined },
  });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Customer", entityId: id, changes: input });
  return customer;
}

export async function deleteCustomer(actor: Actor, id: string) {
  assertWrite(actor.role, "sales");
  await prisma.customer.delete({ where: { id } });
  await writeAuditLog({ userId: actor.id, action: "DELETE", entity: "Customer", entityId: id });
}

// ── Sales Orders ─────────────────────────────────────────────────────────

export async function listOrders() {
  return prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      items: { select: { id: true } },
    },
  });
}

export async function getOrder(id: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { name: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true, uom: true } },
          batch: { select: { batchNumber: true } },
          finishedGood: { select: { id: true, quantity: true, uom: true, status: true } },
        },
      },
      deliveryNote: true,
    },
  });
}

export async function createOrder(actor: Actor, input: CreateOrderInput) {
  assertWrite(actor.role, "sales");

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: generateCode("SO"),
      customerId: input.customerId,
      createdById: actor.id,
      status: "PENDING",
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
  });

  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "SalesOrder", entityId: order.id });
  return order;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["BATCH_MATCHED", "CANCELLED"],
  BATCH_MATCHED: ["PICKED_PACKED", "CANCELLED"],
  PICKED_PACKED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

/** Finished goods available for matching against a given order line item's product. */
export async function listAvailableFinishedGoods(productId: string) {
  return prisma.finishedGood.findMany({
    where: { productId, status: "IN_STORAGE" },
    orderBy: { createdAt: "asc" },
  });
}

export async function matchBatchToOrder(actor: Actor, orderId: string, input: MatchBatchInput) {
  assertWrite(actor.role, "sales");

  const order = await prisma.salesOrder.findUniqueOrThrow({ where: { id: orderId } });
  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes("BATCH_MATCHED")) {
    throw new Error(`Cannot move order from ${order.status} to BATCH_MATCHED`);
  }

  await prisma.$transaction(async (tx) => {
    for (const match of input.matches) {
      const finishedGood = await tx.finishedGood.findUniqueOrThrow({ where: { id: match.finishedGoodId } });
      if (finishedGood.status !== "IN_STORAGE") {
        throw new Error(`Finished good is no longer available.`);
      }

      await tx.salesOrderItem.update({
        where: { id: match.itemId },
        data: { finishedGoodId: match.finishedGoodId, batchId: finishedGood.batchId },
      });

      await tx.finishedGood.update({ where: { id: match.finishedGoodId }, data: { status: "ALLOCATED" } });
    }

    await tx.salesOrder.update({ where: { id: orderId }, data: { status: "BATCH_MATCHED" } });
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "SalesOrder",
    entityId: orderId,
    changes: { from: order.status, to: "BATCH_MATCHED", matches: input.matches },
  });

  return order;
}

export async function transitionOrder(actor: Actor, orderId: string, toStatus: OrderStatus, note?: string) {
  assertWrite(actor.role, "sales");

  const order = await prisma.salesOrder.findUniqueOrThrow({ where: { id: orderId } });
  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes(toStatus)) {
    throw new Error(`Cannot move order from ${order.status} to ${toStatus}`);
  }
  if (toStatus === "DISPATCHED") {
    throw new Error("Use dispatchOrder to transition to DISPATCHED.");
  }
  if (toStatus === "DELIVERED") {
    throw new Error("Use confirmDelivery to transition to DELIVERED.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.salesOrder.update({ where: { id: orderId }, data: { status: toStatus } });

    if (toStatus === "CANCELLED") {
      const items = await tx.salesOrderItem.findMany({ where: { orderId }, select: { finishedGoodId: true } });
      const finishedGoodIds = items.map((i) => i.finishedGoodId).filter((id): id is string => !!id);
      if (finishedGoodIds.length > 0) {
        await tx.finishedGood.updateMany({
          where: { id: { in: finishedGoodIds } },
          data: { status: "IN_STORAGE" },
        });
      }
    }
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "SalesOrder",
    entityId: orderId,
    changes: { from: order.status, to: toStatus, note },
  });

  return order;
}

export async function dispatchOrder(actor: Actor, orderId: string, input: DispatchOrderInput) {
  assertWrite(actor.role, "sales");

  const order = await prisma.salesOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { select: { finishedGoodId: true } }, deliveryNote: true },
  });
  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes("DISPATCHED")) {
    throw new Error(`Cannot move order from ${order.status} to DISPATCHED`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.salesOrder.update({ where: { id: orderId }, data: { status: "DISPATCHED" } });

    if (!order.deliveryNote) {
      await tx.deliveryNote.create({
        data: {
          orderId,
          deliveryNumber: generateCode("DN"),
          vehicleNo: input.vehicleNo,
          driverName: input.driverName,
          dispatchedAt: new Date(),
          status: "DISPATCHED",
        },
      });
    } else {
      await tx.deliveryNote.update({
        where: { orderId },
        data: {
          vehicleNo: input.vehicleNo,
          driverName: input.driverName,
          dispatchedAt: new Date(),
          status: "DISPATCHED",
        },
      });
    }

    const finishedGoodIds = order.items.map((i) => i.finishedGoodId).filter((id): id is string => !!id);
    if (finishedGoodIds.length > 0) {
      await tx.finishedGood.updateMany({
        where: { id: { in: finishedGoodIds } },
        data: { status: "DISPATCHED" },
      });

      for (const finishedGoodId of finishedGoodIds) {
        const fg = await tx.finishedGood.findUniqueOrThrow({ where: { id: finishedGoodId } });
        await tx.stockMovement.create({
          data: {
            itemType: "FINISHED_GOOD",
            finishedGoodId,
            type: "DISPATCH",
            quantity: fg.quantity,
            reference: `Sales order ${orderId} dispatch (${input.vehicleNo ?? "no vehicle logged"})`,
            userId: actor.id,
          },
        });
      }
    }
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "SalesOrder",
    entityId: orderId,
    changes: { from: order.status, to: "DISPATCHED", vehicleNo: input.vehicleNo, driverName: input.driverName },
  });

  return order;
}

export async function confirmDelivery(actor: Actor, orderId: string) {
  assertWrite(actor.role, "sales");

  const order = await prisma.salesOrder.findUniqueOrThrow({ where: { id: orderId } });
  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes("DELIVERED")) {
    throw new Error(`Cannot move order from ${order.status} to DELIVERED`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.salesOrder.update({ where: { id: orderId }, data: { status: "DELIVERED" } });
    await tx.deliveryNote.update({
      where: { orderId },
      data: { confirmedAt: new Date(), status: "CONFIRMED" },
    });
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "SalesOrder",
    entityId: orderId,
    changes: { from: order.status, to: "DELIVERED" },
  });

  return order;
}

export async function getOrderAuditTrail(orderId: string) {
  return prisma.auditLog.findMany({
    where: { entity: "SalesOrder", entityId: orderId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });
}

// ── Deliveries ───────────────────────────────────────────────────────────

export async function listDeliveries() {
  return prisma.deliveryNote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { id: true, orderNumber: true, customer: { select: { name: true } } } },
    },
  });
}

// ── Complaints ───────────────────────────────────────────────────────────

export async function listComplaints() {
  return prisma.customerComplaint.findMany({
    orderBy: { raisedAt: "desc" },
    include: {
      customer: { select: { name: true } },
      order: { select: { orderNumber: true } },
      handledBy: { select: { name: true } },
    },
  });
}

export async function createComplaint(actor: Actor, input: ComplaintInput) {
  assertWrite(actor.role, "sales");

  const complaint = await prisma.customerComplaint.create({
    data: {
      customerId: input.customerId,
      orderId: input.orderId || undefined,
      description: input.description,
      status: input.status,
      resolution: input.resolution || undefined,
      handledById: actor.id,
      resolvedAt: input.status === "RESOLVED" ? new Date() : undefined,
    },
  });

  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "CustomerComplaint", entityId: complaint.id });

  await notifyRoles({
    roles: ["SALES_OFFICER", "CEO"],
    title: "New customer complaint",
    message: `A new complaint has been raised.`,
    type: "WARNING",
    link: "/sales/complaints",
  });

  return complaint;
}

export async function updateComplaint(actor: Actor, id: string, input: ComplaintInput) {
  assertWrite(actor.role, "sales");

  const existing = await prisma.customerComplaint.findUniqueOrThrow({ where: { id } });
  const complaint = await prisma.customerComplaint.update({
    where: { id },
    data: {
      customerId: input.customerId,
      orderId: input.orderId || undefined,
      description: input.description,
      status: input.status,
      resolution: input.resolution || undefined,
      resolvedAt: input.status === "RESOLVED" ? (existing.resolvedAt ?? new Date()) : null,
    },
  });

  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "CustomerComplaint", entityId: id, changes: input });
  return complaint;
}

export async function resolveComplaint(actor: Actor, id: string, resolution: string) {
  assertWrite(actor.role, "sales");

  const complaint = await prisma.customerComplaint.update({
    where: { id },
    data: { status: "RESOLVED", resolution, resolvedAt: new Date(), handledById: actor.id },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "CustomerComplaint",
    entityId: id,
    changes: { to: "RESOLVED", resolution },
  });

  return complaint;
}
