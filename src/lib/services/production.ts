import type { BatchStatus, Role } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { notifyRoles } from "@/lib/notify";
import { assertWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/utils";
import type { CreateBatchInput, ProductInput } from "@/lib/validations/production";

type Actor = { id: string; role: Role };

// ── Products ────────────────────────────────────────────────────────────

export async function listProducts() {
  return prisma.product.findMany({ orderBy: { name: "asc" } });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(actor: Actor, input: ProductInput) {
  assertWrite(actor.role, "production");
  const product = await prisma.product.create({ data: input });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "Product", entityId: product.id });
  return product;
}

export async function updateProduct(actor: Actor, id: string, input: ProductInput) {
  assertWrite(actor.role, "production");
  const product = await prisma.product.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Product", entityId: id, changes: input });
  return product;
}

export async function archiveProduct(actor: Actor, id: string) {
  assertWrite(actor.role, "production");
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Product", entityId: id, changes: { isActive: false } });
}

// ── Batches ─────────────────────────────────────────────────────────────

export async function listBatches() {
  return prisma.batchCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, sku: true } } },
  });
}

export async function getBatch(id: string) {
  return prisma.batchCard.findUnique({
    where: { id },
    include: {
      product: true,
      createdBy: { select: { name: true } },
      materials: { include: { rawMaterial: true, stockLot: true } },
      logs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      sampleRequests: { include: { labTest: { include: { parameters: true } } }, orderBy: { createdAt: "desc" } },
      finishedGoods: true,
    },
  });
}

export async function createBatch(actor: Actor, input: CreateBatchInput) {
  assertWrite(actor.role, "production");

  const batch = await prisma.batchCard.create({
    data: {
      batchNumber: generateCode("BATCH"),
      productId: input.productId,
      plannedQty: input.plannedQty,
      uom: input.uom,
      notes: input.notes,
      createdById: actor.id,
      status: "DRAFT",
      materials: {
        create: input.materials.map((m) => ({
          rawMaterialId: m.rawMaterialId,
          qtyPlanned: m.qtyPlanned,
          uom: m.uom,
        })),
      },
      logs: {
        create: [{ stage: "DRAFT", note: "Batch card created", userId: actor.id }],
      },
    },
  });

  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "BatchCard", entityId: batch.id });
  return batch;
}

const ALLOWED_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  DRAFT: ["MATERIALS_VERIFIED", "ON_HOLD", "REJECTED"],
  MATERIALS_VERIFIED: ["IN_BLENDING", "ON_HOLD", "REJECTED"],
  IN_BLENDING: ["LAB_TEST_PENDING", "ON_HOLD", "REJECTED"],
  LAB_TEST_PENDING: ["ADJUSTMENT", "FILTERING", "ON_HOLD", "REJECTED"],
  ADJUSTMENT: ["LAB_TEST_PENDING", "ON_HOLD", "REJECTED"],
  FILTERING: ["FILLING", "ON_HOLD", "REJECTED"],
  FILLING: ["BADGING", "ON_HOLD", "REJECTED"],
  BADGING: ["PACKAGING", "ON_HOLD", "REJECTED"],
  PACKAGING: ["STORED", "ON_HOLD", "REJECTED"],
  STORED: ["COMPLETED"],
  COMPLETED: [],
  ON_HOLD: [
    "MATERIALS_VERIFIED",
    "IN_BLENDING",
    "LAB_TEST_PENDING",
    "ADJUSTMENT",
    "FILTERING",
    "FILLING",
    "BADGING",
    "PACKAGING",
    "REJECTED",
  ],
  REJECTED: [],
};

export function getAllowedNextStatuses(current: BatchStatus): BatchStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export async function transitionBatch(
  actor: Actor,
  batchId: string,
  toStatus: BatchStatus,
  note?: string
) {
  assertWrite(actor.role, "production");

  const batch = await prisma.batchCard.findUniqueOrThrow({ where: { id: batchId } });
  const allowed = getAllowedNextStatuses(batch.status);
  if (!allowed.includes(toStatus)) {
    throw new Error(`Cannot move batch from ${batch.status} to ${toStatus}`);
  }

  const data: Record<string, unknown> = { status: toStatus };
  if (toStatus === "IN_BLENDING" && !batch.startedAt) data.startedAt = new Date();
  if (toStatus === "COMPLETED" || toStatus === "REJECTED") data.completedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.batchCard.update({ where: { id: batchId }, data });
    await tx.productionLog.create({
      data: { batchId, stage: toStatus, note, userId: actor.id },
    });

    if (toStatus === "LAB_TEST_PENDING") {
      const existingPending = await tx.qCSampleRequest.findFirst({
        where: { batchId, status: "PENDING" },
      });
      if (!existingPending) {
        await tx.qCSampleRequest.create({
          data: { batchId, requestedById: actor.id, status: "PENDING" },
        });
      }
    }

    if (toStatus === "STORED") {
      await tx.finishedGood.create({
        data: {
          productId: batch.productId,
          batchId: batch.id,
          quantity: batch.plannedQty,
          uom: batch.uom,
          status: "IN_STORAGE",
        },
      });
    }
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "BatchCard",
    entityId: batchId,
    changes: { from: batch.status, to: toStatus },
  });

  if (toStatus === "LAB_TEST_PENDING") {
    await notifyRoles({
      roles: ["QC_OFFICER"],
      title: "New sample request",
      message: `Batch ${batch.batchNumber} is awaiting lab test entry.`,
      type: "WARNING",
      link: "/quality/sample-requests",
    });
  }
  if (toStatus === "ON_HOLD") {
    await notifyRoles({
      roles: ["PRODUCTION_MANAGER", "SUPER_ADMIN"],
      title: "Batch put on hold",
      message: `Batch ${batch.batchNumber} was placed on hold.`,
      type: "ERROR",
      link: `/production/batches/${batchId}`,
    });
  }

  return batch;
}

export async function consumeBatchMaterials(
  actor: Actor,
  batchId: string,
  consumptions: { batchMaterialId: string; qtyUsed: number }[]
) {
  assertWrite(actor.role, "production");

  await prisma.$transaction(async (tx) => {
    for (const c of consumptions) {
      const material = await tx.batchMaterial.findUniqueOrThrow({
        where: { id: c.batchMaterialId },
      });

      const lot = await tx.stockLot.findFirst({
        where: { rawMaterialId: material.rawMaterialId, status: "AVAILABLE", quantityRemaining: { gt: 0 } },
        orderBy: { receivedDate: "asc" },
      });
      if (!lot) throw new Error("No available stock lot for this raw material.");
      if (lot.quantityRemaining < c.qtyUsed) {
        throw new Error(`Insufficient stock in lot ${lot.lotNumber} (FIFO oldest available).`);
      }

      await tx.batchMaterial.update({
        where: { id: c.batchMaterialId },
        data: { qtyUsed: c.qtyUsed, stockLotId: lot.id },
      });

      const remaining = lot.quantityRemaining - c.qtyUsed;
      await tx.stockLot.update({
        where: { id: lot.id },
        data: { quantityRemaining: remaining, status: remaining <= 0 ? "CONSUMED" : "AVAILABLE" },
      });

      await tx.stockMovement.create({
        data: {
          itemType: "RAW_MATERIAL",
          stockLotId: lot.id,
          type: "ISSUE",
          quantity: c.qtyUsed,
          reference: `Batch ${batchId}`,
          userId: actor.id,
        },
      });
    }
  });

  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "BatchMaterial",
    entityId: batchId,
    changes: { consumptions },
  });
}
