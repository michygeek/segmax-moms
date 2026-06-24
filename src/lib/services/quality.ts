import type { NCRStatus, Role } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit";
import { notifyRoles } from "@/lib/notify";
import { assertWrite, canRead } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { transitionBatchAsSideEffect } from "@/lib/services/production";
import type {
  CreateSampleRequestInput,
  NcrInput,
  RetentionSampleInput,
  SubmitLabTestInput,
} from "@/lib/validations/quality";

type Actor = { id: string; role: Role };

// ── Sample Requests ─────────────────────────────────────────────────────────

export async function listSampleRequests() {
  return prisma.qCSampleRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      batch: { include: { product: { select: { name: true, sku: true } } } },
      requestedBy: { select: { name: true } },
      labTest: { include: { parameters: true } },
    },
  });
}

export async function getSampleRequest(actorRole: Role, id: string) {
  if (!canRead(actorRole, "quality")) return null;
  return prisma.qCSampleRequest.findUnique({
    where: { id },
    include: {
      batch: { include: { product: true } },
      requestedBy: { select: { name: true } },
      labTest: { include: { parameters: true, testedBy: { select: { name: true } } } },
    },
  });
}

/** Rare ad-hoc path — normally sample requests are auto-created by transitionBatch(). */
export async function createSampleRequest(actor: Actor, input: CreateSampleRequestInput) {
  assertWrite(actor.role, "quality");

  const request = await prisma.qCSampleRequest.create({
    data: {
      batchId: input.batchId,
      requestedById: actor.id,
      notes: input.notes,
      status: "PENDING",
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "QCSampleRequest",
    entityId: request.id,
  });

  return request;
}

/**
 * Records the lab test result for a pending sample request, then immediately
 * advances the linked batch (FILTERING on PASS, ADJUSTMENT otherwise) via the
 * production service — the SOP treats test entry + release/rework as one step.
 * Optionally raises a Non-Conformance Report when the result is FAIL.
 */
export async function submitLabTestAndRelease(
  actor: Actor,
  sampleRequestId: string,
  input: SubmitLabTestInput
) {
  assertWrite(actor.role, "quality");

  const sampleRequest = await prisma.qCSampleRequest.findUniqueOrThrow({
    where: { id: sampleRequestId },
    include: { batch: true },
  });

  if (sampleRequest.status !== "PENDING") {
    throw new Error("This sample request has already been tested.");
  }

  const labTest = await prisma.$transaction(async (tx) => {
    // Atomically claim the sample request first — guards against a double
    // submit (double-click/retry) racing past the PENDING check above and
    // both creating a LabTest for the same request.
    const claimed = await tx.qCSampleRequest.updateMany({
      where: { id: sampleRequestId, status: "PENDING" },
      data: { status: "TESTED" },
    });
    if (claimed.count === 0) {
      throw new Error("This sample request has already been tested.");
    }

    const created = await tx.labTest.create({
      data: {
        sampleRequestId,
        batchId: sampleRequest.batchId,
        testedById: actor.id,
        result: input.result,
        remarks: input.remarks,
        parameters: {
          create: input.parameters.map((p) => ({
            parameterName: p.parameterName,
            unit: p.unit,
            specMin: p.specMin ?? null,
            specMax: p.specMax ?? null,
            actualValue: p.actualValue,
            passed:
              (p.specMin == null || p.actualValue >= p.specMin) &&
              (p.specMax == null || p.actualValue <= p.specMax),
          })),
        },
      },
      include: { parameters: true },
    });

    return created;
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "LabTest",
    entityId: labTest.id,
    changes: { result: input.result, sampleRequestId },
  });

  const nextStatus = input.result === "PASS" ? "FILTERING" : "ADJUSTMENT";
  await transitionBatchAsSideEffect(actor, sampleRequest.batchId, nextStatus, input.remarks);

  let ncr = null;
  if (input.result === "FAIL" && input.raiseNcr) {
    ncr = await createNcr(actor, {
      batchId: sampleRequest.batchId,
      description: `Lab test failure: ${input.remarks || "No remarks provided."}`,
    });
  }

  return { labTest, ncr };
}

// ── Non-Conformance Reports ─────────────────────────────────────────────────

export async function listNcrs() {
  return prisma.nonConformanceReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      batch: { select: { batchNumber: true } },
      raisedBy: { select: { name: true } },
    },
  });
}

export async function getNcr(id: string) {
  return prisma.nonConformanceReport.findUnique({
    where: { id },
    include: {
      batch: { select: { batchNumber: true } },
      raisedBy: { select: { name: true } },
    },
  });
}

export async function createNcr(actor: Actor, input: NcrInput) {
  assertWrite(actor.role, "quality");

  const ncr = await prisma.nonConformanceReport.create({
    data: {
      batchId: input.batchId || null,
      description: input.description,
      rootCause: input.rootCause,
      correctiveAction: input.correctiveAction,
      raisedById: actor.id,
      status: "OPEN",
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "NonConformanceReport",
    entityId: ncr.id,
  });

  await notifyRoles({
    roles: ["QC_OFFICER", "PRODUCTION_MANAGER"],
    title: "Non-Conformance Report raised",
    message: ncr.description,
    type: "ERROR",
    link: "/quality/ncr",
  });

  return ncr;
}

export async function updateNcr(actor: Actor, id: string, input: NcrInput) {
  assertWrite(actor.role, "quality");

  const ncr = await prisma.nonConformanceReport.update({
    where: { id },
    data: {
      batchId: input.batchId || null,
      description: input.description,
      rootCause: input.rootCause,
      correctiveAction: input.correctiveAction,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "NonConformanceReport",
    entityId: id,
    changes: input,
  });

  return ncr;
}

export async function setNcrStatus(actor: Actor, id: string, status: NCRStatus) {
  assertWrite(actor.role, "quality");

  const ncr = await prisma.nonConformanceReport.update({
    where: { id },
    data: {
      status,
      closedAt: status === "CLOSED" ? new Date() : null,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "STATUS_CHANGE",
    entity: "NonConformanceReport",
    entityId: id,
    changes: { status },
  });

  return ncr;
}

// ── Retention Samples ────────────────────────────────────────────────────────

export async function listRetentionSamples() {
  return prisma.retentionSample.findMany({
    orderBy: { createdAt: "desc" },
    include: { batch: { select: { batchNumber: true } } },
  });
}

export async function getRetentionSample(id: string) {
  return prisma.retentionSample.findUnique({
    where: { id },
    include: { batch: { select: { batchNumber: true } } },
  });
}

export async function createRetentionSample(actor: Actor, input: RetentionSampleInput) {
  assertWrite(actor.role, "quality");

  const sample = await prisma.retentionSample.create({
    data: {
      batchId: input.batchId,
      location: input.location,
      retainedUntil: input.retainedUntil,
      disposed: input.disposed ?? false,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "CREATE",
    entity: "RetentionSample",
    entityId: sample.id,
  });

  return sample;
}

export async function updateRetentionSample(actor: Actor, id: string, input: RetentionSampleInput) {
  assertWrite(actor.role, "quality");

  const sample = await prisma.retentionSample.update({
    where: { id },
    data: {
      batchId: input.batchId,
      location: input.location,
      retainedUntil: input.retainedUntil,
      disposed: input.disposed ?? false,
    },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "RetentionSample",
    entityId: id,
    changes: input,
  });

  return sample;
}

export async function disposeRetentionSample(actor: Actor, id: string) {
  assertWrite(actor.role, "quality");

  const sample = await prisma.retentionSample.update({
    where: { id },
    data: { disposed: true },
  });

  await writeAuditLog({
    userId: actor.id,
    action: "UPDATE",
    entity: "RetentionSample",
    entityId: id,
    changes: { disposed: true },
  });

  return sample;
}

// ── Shared lookups ───────────────────────────────────────────────────────────

/** Recent batches for select dropdowns (NCR / Retention Sample forms). */
export async function listRecentBatchesForSelect() {
  return prisma.batchCard.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, batchNumber: true, product: { select: { name: true } } },
  });
}
