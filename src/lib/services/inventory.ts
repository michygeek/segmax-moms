import type { Role, StockLotStatus } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { notifyRoles } from "@/lib/notify";
import { assertWrite } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { COA_BUCKET, uploadFile } from "@/lib/supabase";
import { generateCode } from "@/lib/utils";
import type {
  AdjustStockLotInput,
  ReceiveStockLotInput,
  RawMaterialInput,
  StorageLocationInput,
  SupplierInput,
} from "@/lib/validations/inventory";

type Actor = { id: string; role: Role };

export async function listRawMaterials() {
  return prisma.rawMaterial.findMany({ orderBy: { name: "asc" } });
}

// ── Raw Materials ──────────────────────────────────────────────────────────

export async function listRawMaterialsWithStock() {
  const materials = await prisma.rawMaterial.findMany({
    orderBy: { name: "asc" },
    include: {
      stockLots: { where: { status: "AVAILABLE" }, select: { quantityRemaining: true } },
    },
  });

  return materials.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.code,
    uom: m.uom,
    reorderLevel: m.reorderLevel,
    availableStock: m.stockLots.reduce((sum, l) => sum + l.quantityRemaining, 0),
  }));
}

export async function createRawMaterial(actor: Actor, input: RawMaterialInput) {
  assertWrite(actor.role, "inventory");
  const material = await prisma.rawMaterial.create({ data: input });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "RawMaterial", entityId: material.id });
  return material;
}

export async function updateRawMaterial(actor: Actor, id: string, input: RawMaterialInput) {
  assertWrite(actor.role, "inventory");
  const material = await prisma.rawMaterial.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "RawMaterial", entityId: id, changes: input });
  return material;
}

// ── Suppliers ───────────────────────────────────────────────────────────────

export async function listSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}

export async function createSupplier(actor: Actor, input: SupplierInput) {
  assertWrite(actor.role, "inventory");
  const supplier = await prisma.supplier.create({
    data: { ...input, email: input.email || undefined },
  });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "Supplier", entityId: supplier.id });
  return supplier;
}

export async function updateSupplier(actor: Actor, id: string, input: SupplierInput) {
  assertWrite(actor.role, "inventory");
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { ...input, email: input.email || undefined },
  });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "Supplier", entityId: id, changes: input });
  return supplier;
}

// ── Storage Locations ───────────────────────────────────────────────────────

export async function listStorageLocations() {
  return prisma.storageLocation.findMany({ orderBy: { name: "asc" } });
}

export async function createStorageLocation(actor: Actor, input: StorageLocationInput) {
  assertWrite(actor.role, "inventory");
  const location = await prisma.storageLocation.create({ data: input });
  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "StorageLocation", entityId: location.id });
  return location;
}

export async function updateStorageLocation(actor: Actor, id: string, input: StorageLocationInput) {
  assertWrite(actor.role, "inventory");
  const location = await prisma.storageLocation.update({ where: { id }, data: input });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "StorageLocation", entityId: id, changes: input });
  return location;
}

// ── Stock Lots (FIFO) ────────────────────────────────────────────────────────

export async function listStockLots() {
  return prisma.stockLot.findMany({
    orderBy: { receivedDate: "asc" },
    include: {
      rawMaterial: { select: { name: true, code: true } },
      supplier: { select: { name: true } },
      storageLocation: { select: { name: true } },
    },
  });
}

export async function getStockLot(id: string) {
  return prisma.stockLot.findUnique({
    where: { id },
    include: {
      rawMaterial: true,
      supplier: true,
      storageLocation: true,
    },
  });
}

export async function getExpiringLots(days = 30) {
  const horizon = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return prisma.stockLot.findMany({
    where: {
      status: "AVAILABLE",
      expiryDate: { lte: horizon, gte: new Date() },
    },
    orderBy: { expiryDate: "asc" },
    include: { rawMaterial: { select: { name: true } } },
  });
}

export async function getLowStockMaterials() {
  const materials = await prisma.rawMaterial.findMany({
    include: {
      stockLots: { where: { status: "AVAILABLE" }, select: { quantityRemaining: true } },
    },
  });

  return materials
    .map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code,
      uom: m.uom,
      reorderLevel: m.reorderLevel,
      availableStock: m.stockLots.reduce((sum, l) => sum + l.quantityRemaining, 0),
    }))
    .filter((m) => m.availableStock < m.reorderLevel);
}

export async function receiveStockLot(actor: Actor, input: ReceiveStockLotInput) {
  assertWrite(actor.role, "inventory");

  const rawMaterial = await prisma.rawMaterial.findUniqueOrThrow({ where: { id: input.rawMaterialId } });

  const lot = await prisma.$transaction(async (tx) => {
    const created = await tx.stockLot.create({
      data: {
        lotNumber: generateCode("LOT"),
        rawMaterialId: input.rawMaterialId,
        supplierId: input.supplierId || undefined,
        quantityReceived: input.quantityReceived,
        quantityRemaining: input.quantityReceived,
        uom: input.uom,
        receivedDate: input.receivedDate,
        expiryDate: input.expiryDate ?? undefined,
        storageLocationId: input.storageLocationId || undefined,
        status: "AVAILABLE",
      },
    });

    await tx.stockMovement.create({
      data: {
        itemType: "RAW_MATERIAL",
        stockLotId: created.id,
        type: "RECEIPT",
        quantity: input.quantityReceived,
        toLocation: input.storageLocationId || undefined,
        reference: `Received lot ${created.lotNumber}`,
        userId: actor.id,
      },
    });

    return created;
  });

  await writeAuditLog({ userId: actor.id, action: "CREATE", entity: "StockLot", entityId: lot.id });

  // Low-stock check after receipt.
  const availableAgg = await prisma.stockLot.aggregate({
    where: { rawMaterialId: input.rawMaterialId, status: "AVAILABLE" },
    _sum: { quantityRemaining: true },
  });
  const totalAvailable = availableAgg._sum.quantityRemaining ?? 0;
  if (totalAvailable < rawMaterial.reorderLevel) {
    await notifyRoles({
      roles: ["STORE_MANAGER", "PRODUCTION_MANAGER"],
      title: "Low stock alert",
      message: `${rawMaterial.name} is below its reorder level (${totalAvailable} ${rawMaterial.uom} remaining).`,
      type: "WARNING",
      link: "/inventory/raw-materials",
    });
  }

  // Expiry check at creation time.
  if (input.expiryDate) {
    const daysToExpiry = (new Date(input.expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    if (daysToExpiry <= 14) {
      await notifyRoles({
        roles: ["STORE_MANAGER", "PRODUCTION_MANAGER"],
        title: "Lot nearing expiry",
        message: `Lot ${lot.lotNumber} (${rawMaterial.name}) expires on ${new Date(input.expiryDate).toLocaleDateString()}.`,
        type: "WARNING",
        link: "/inventory/stock-lots",
      });
    }
  }

  return lot;
}

export async function adjustStockLot(actor: Actor, id: string, input: AdjustStockLotInput) {
  assertWrite(actor.role, "inventory");

  const lot = await prisma.stockLot.findUniqueOrThrow({ where: { id } });
  const fromStatus = lot.status;

  await prisma.$transaction(async (tx) => {
    await tx.stockLot.update({ where: { id }, data: { status: input.status } });
    await tx.stockMovement.create({
      data: {
        itemType: "RAW_MATERIAL",
        stockLotId: id,
        type: "ADJUSTMENT",
        quantity: lot.quantityRemaining,
        reference: input.reason,
        userId: actor.id,
      },
    });
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "StockLot",
    entityId: id,
    changes: { from: fromStatus, to: input.status, reason: input.reason },
  });

  return lot;
}

export async function uploadStockLotCoa(actor: Actor, id: string, file: File) {
  assertWrite(actor.role, "inventory");

  const url = await uploadFile({ bucket: COA_BUCKET, path: `coa/${id}-${file.name}`, file });

  await prisma.stockLot.update({ where: { id }, data: { coaUrl: url } });
  await writeAuditLog({ userId: actor.id, action: "UPDATE", entity: "StockLot", entityId: id, changes: { coaUrl: url } });

  return url;
}

// ── Finished Goods ───────────────────────────────────────────────────────────

export async function listFinishedGoods() {
  return prisma.finishedGood.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, sku: true } },
      batch: { select: { batchNumber: true } },
      storageLocation: { select: { name: true } },
    },
  });
}

export async function transferFinishedGood(actor: Actor, id: string, storageLocationId: string) {
  assertWrite(actor.role, "inventory");

  const finishedGood = await prisma.finishedGood.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction(async (tx) => {
    await tx.finishedGood.update({ where: { id }, data: { storageLocationId } });
    await tx.stockMovement.create({
      data: {
        itemType: "FINISHED_GOOD",
        finishedGoodId: id,
        type: "TRANSFER",
        quantity: finishedGood.quantity,
        fromLocation: finishedGood.storageLocationId ?? undefined,
        toLocation: storageLocationId,
        userId: actor.id,
      },
    });
  });

  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "FinishedGood",
    entityId: id,
    changes: { storageLocationId },
  });
}

export async function dispatchFinishedGood(actor: Actor, id: string) {
  assertWrite(actor.role, "inventory");

  const finishedGood = await prisma.finishedGood.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction(async (tx) => {
    await tx.finishedGood.update({ where: { id }, data: { status: "DISPATCHED" } });
    await tx.stockMovement.create({
      data: {
        itemType: "FINISHED_GOOD",
        finishedGoodId: id,
        type: "DISPATCH",
        quantity: finishedGood.quantity,
        fromLocation: finishedGood.storageLocationId ?? undefined,
        userId: actor.id,
      },
    });
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "FinishedGood",
    entityId: id,
    changes: { from: finishedGood.status, to: "DISPATCHED" },
  });
}

// ── Stock Movements ──────────────────────────────────────────────────────────

export async function listStockMovements() {
  return prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      stockLot: { select: { lotNumber: true, rawMaterial: { select: { name: true } } } },
      finishedGood: { select: { product: { select: { name: true } } } },
      user: { select: { name: true } },
    },
  });
}

export type { StockLotStatus };
