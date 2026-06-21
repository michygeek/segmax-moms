import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Passw0rd!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [ceo, admin, prodMgr, storeMgr, qcOfficer, hrOfficer, salesOfficer, safetyOfficer] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: "ceo@segmaxoil.com" },
        update: {},
        create: { name: "Adaeze Okafor", email: "ceo@segmaxoil.com", passwordHash, role: "CEO" },
      }),
      prisma.user.upsert({
        where: { email: "admin@segmaxoil.com" },
        update: {},
        create: { name: "System Admin", email: "admin@segmaxoil.com", passwordHash, role: "SUPER_ADMIN" },
      }),
      prisma.user.upsert({
        where: { email: "production@segmaxoil.com" },
        update: {},
        create: { name: "Tunde Bakare", email: "production@segmaxoil.com", passwordHash, role: "PRODUCTION_MANAGER" },
      }),
      prisma.user.upsert({
        where: { email: "store@segmaxoil.com" },
        update: {},
        create: { name: "Ifeoma Chukwu", email: "store@segmaxoil.com", passwordHash, role: "STORE_MANAGER" },
      }),
      prisma.user.upsert({
        where: { email: "qc@segmaxoil.com" },
        update: {},
        create: { name: "Musa Abdullahi", email: "qc@segmaxoil.com", passwordHash, role: "QC_OFFICER" },
      }),
      prisma.user.upsert({
        where: { email: "hr@segmaxoil.com" },
        update: {},
        create: { name: "Grace Adeyemi", email: "hr@segmaxoil.com", passwordHash, role: "HR_OFFICER" },
      }),
      prisma.user.upsert({
        where: { email: "sales@segmaxoil.com" },
        update: {},
        create: { name: "Emeka Nwosu", email: "sales@segmaxoil.com", passwordHash, role: "SALES_OFFICER" },
      }),
      prisma.user.upsert({
        where: { email: "safety@segmaxoil.com" },
        update: {},
        create: { name: "Bola Salako", email: "safety@segmaxoil.com", passwordHash, role: "SAFETY_OFFICER" },
      }),
    ]);

  console.log("Seeded users for all 8 roles. Demo password:", DEMO_PASSWORD);

  // ── Inventory master data ────────────────────────────────────────────
  const supplier1 = await prisma.supplier.create({
    data: { name: "Chemcorp Nigeria Ltd", contactName: "Wale Ojo", phone: "+234 803 123 4567", email: "sales@chemcorp.ng" },
  });
  const supplier2 = await prisma.supplier.create({
    data: { name: "Base Oil Traders Ltd", contactName: "Hassan Bello", phone: "+234 805 987 6543", email: "info@baseoiltraders.com" },
  });

  const rawMaterialBaseOil = await prisma.rawMaterial.create({
    data: { name: "Base Oil SN500", code: "RM-BASEOIL-500", uom: "L", reorderLevel: 5000 },
  });
  const rawMaterialAdditive = await prisma.rawMaterial.create({
    data: { name: "Additive Package AP-7", code: "RM-ADD-AP7", uom: "L", reorderLevel: 800 },
  });
  const rawMaterialViscosity = await prisma.rawMaterial.create({
    data: { name: "Viscosity Modifier VM-2", code: "RM-VM-2", uom: "L", reorderLevel: 400 },
  });
  const rawMaterialBottle = await prisma.rawMaterial.create({
    data: { name: "1L PET Bottle", code: "PK-BOTTLE-1L", uom: "PCS", reorderLevel: 10000 },
  });
  const rawMaterialCap = await prisma.rawMaterial.create({
    data: { name: "Bottle Cap", code: "PK-CAP-STD", uom: "PCS", reorderLevel: 10000 },
  });

  const rawWarehouse = await prisma.storageLocation.create({
    data: { name: "Raw Material Warehouse A", type: "RAW_MATERIAL", capacity: 50000 },
  });
  const fgWarehouse = await prisma.storageLocation.create({
    data: { name: "Finished Goods Warehouse", type: "FINISHED_GOODS", capacity: 30000 },
  });

  const now = new Date();
  const in180Days = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const lotBaseOil = await prisma.stockLot.create({
    data: {
      lotNumber: "LOT-BASEOIL-0001",
      rawMaterialId: rawMaterialBaseOil.id,
      supplierId: supplier2.id,
      quantityReceived: 20000,
      quantityRemaining: 17500,
      uom: "L",
      receivedDate: now,
      expiryDate: in180Days,
      storageLocationId: rawWarehouse.id,
      status: "AVAILABLE",
    },
  });
  const lotAdditive = await prisma.stockLot.create({
    data: {
      lotNumber: "LOT-ADD-0001",
      rawMaterialId: rawMaterialAdditive.id,
      supplierId: supplier1.id,
      quantityReceived: 2000,
      quantityRemaining: 1450,
      uom: "L",
      receivedDate: now,
      expiryDate: in14Days,
      storageLocationId: rawWarehouse.id,
      status: "AVAILABLE",
    },
  });
  await prisma.stockLot.create({
    data: {
      lotNumber: "LOT-VM2-0001",
      rawMaterialId: rawMaterialViscosity.id,
      supplierId: supplier1.id,
      quantityReceived: 800,
      quantityRemaining: 800,
      uom: "L",
      receivedDate: now,
      expiryDate: in180Days,
      storageLocationId: rawWarehouse.id,
      status: "AVAILABLE",
    },
  });
  await prisma.stockLot.create({
    data: {
      lotNumber: "LOT-BOTTLE-0001",
      rawMaterialId: rawMaterialBottle.id,
      quantityReceived: 50000,
      quantityRemaining: 42000,
      uom: "PCS",
      receivedDate: now,
      storageLocationId: rawWarehouse.id,
      status: "AVAILABLE",
    },
  });
  await prisma.stockLot.create({
    data: {
      lotNumber: "LOT-CAP-0001",
      rawMaterialId: rawMaterialCap.id,
      quantityReceived: 50000,
      quantityRemaining: 42000,
      uom: "PCS",
      receivedDate: now,
      storageLocationId: rawWarehouse.id,
      status: "AVAILABLE",
    },
  });

  // ── Production ────────────────────────────────────────────────────────
  const product = await prisma.product.create({
    data: {
      name: "SEGMAX Super Premium 20W-50",
      sku: "SGX-20W50-1L",
      category: "Engine Oil",
      uom: "L",
      specSheet: [
        { parameter: "Viscosity @100C", unit: "cSt", min: 16.3, max: 21.9 },
        { parameter: "Flash Point", unit: "C", min: 200, max: null },
        { parameter: "Density @15C", unit: "kg/L", min: 0.86, max: 0.9 },
      ],
    },
  });
  await prisma.product.create({
    data: {
      name: "SEGMAX Diesel Pro 15W-40",
      sku: "SGX-15W40-1L",
      category: "Engine Oil",
      uom: "L",
      specSheet: [
        { parameter: "Viscosity @100C", unit: "cSt", min: 12.5, max: 16.3 },
        { parameter: "Flash Point", unit: "C", min: 200, max: null },
      ],
    },
  });

  const batch = await prisma.batchCard.create({
    data: {
      batchNumber: "BATCH-20260615-0001",
      productId: product.id,
      plannedQty: 10000,
      uom: "L",
      status: "LAB_TEST_PENDING",
      createdById: prodMgr.id,
      startedAt: now,
      materials: {
        create: [
          { rawMaterialId: rawMaterialBaseOil.id, stockLotId: lotBaseOil.id, qtyPlanned: 8500, qtyUsed: 8500, uom: "L" },
          { rawMaterialId: rawMaterialAdditive.id, stockLotId: lotAdditive.id, qtyPlanned: 1000, qtyUsed: 1000, uom: "L" },
          { rawMaterialId: rawMaterialViscosity.id, qtyPlanned: 500, qtyUsed: 500, uom: "L" },
        ],
      },
      logs: {
        create: [
          { stage: "DRAFT", note: "Batch card created", userId: prodMgr.id },
          { stage: "MATERIALS_VERIFIED", note: "Raw materials confirmed available", userId: prodMgr.id },
          { stage: "IN_BLENDING", note: "Blending started in Vessel 2", userId: prodMgr.id },
          { stage: "LAB_TEST_PENDING", note: "Sample pulled, awaiting QC", userId: prodMgr.id },
        ],
      },
    },
  });

  await prisma.qCSampleRequest.create({
    data: { batchId: batch.id, requestedById: prodMgr.id, status: "PENDING", notes: "Routine pre-filter QC check" },
  });

  const completedBatch = await prisma.batchCard.create({
    data: {
      batchNumber: "BATCH-20260601-0001",
      productId: product.id,
      plannedQty: 8000,
      uom: "L",
      status: "COMPLETED",
      createdById: prodMgr.id,
      startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      logs: {
        create: [
          { stage: "DRAFT", note: "Batch card created", userId: prodMgr.id },
          { stage: "STORED", note: "Moved to finished goods warehouse", userId: prodMgr.id },
          { stage: "COMPLETED", note: "Batch closed out", userId: prodMgr.id },
        ],
      },
    },
  });

  const finishedGood = await prisma.finishedGood.create({
    data: {
      productId: product.id,
      batchId: completedBatch.id,
      quantity: 8000,
      uom: "L",
      storageLocationId: fgWarehouse.id,
      expiryDate: in180Days,
      status: "IN_STORAGE",
    },
  });

  await prisma.stockMovement.create({
    data: {
      itemType: "FINISHED_GOOD",
      finishedGoodId: finishedGood.id,
      type: "RECEIPT",
      quantity: 8000,
      toLocation: fgWarehouse.name,
      reference: `Batch ${completedBatch.batchNumber} stored`,
      userId: prodMgr.id,
    },
  });

  // ── Quality (a closed example for history) ───────────────────────────
  const ncr = await prisma.nonConformanceReport.create({
    data: {
      description: "Viscosity slightly below spec on trial sample, traced to additive dosing variance.",
      rootCause: "Additive pump calibration drift",
      correctiveAction: "Recalibrated dosing pump; added daily calibration check",
      status: "CLOSED",
      raisedById: qcOfficer.id,
      closedAt: now,
    },
  });

  await prisma.retentionSample.create({
    data: {
      batchId: completedBatch.id,
      location: "QC Retention Cabinet - Shelf B2",
      retainedUntil: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
    },
  });

  // ── HR ────────────────────────────────────────────────────────────────
  const employees = await Promise.all(
    [
      { code: "EMP-0001", name: "Chinedu Eze", dept: "Production", role: "Blending Operator" },
      { code: "EMP-0002", name: "Fatima Suleiman", dept: "Production", role: "Filling Line Operator" },
      { code: "EMP-0003", name: "Obinna Igwe", dept: "Quality Control", role: "Lab Technician" },
      { code: "EMP-0004", name: "Yusuf Garba", dept: "Warehouse", role: "Storekeeper" },
      { code: "EMP-0005", name: "Kemi Afolabi", dept: "Safety", role: "Safety Marshal" },
      { code: "EMP-0006", name: "David Okon", dept: "Logistics", role: "Delivery Driver" },
    ].map((e) =>
      prisma.employee.create({
        data: {
          employeeCode: e.code,
          fullName: e.name,
          department: e.dept,
          position: e.role,
          hireDate: new Date(now.getFullYear() - 1, 0, 15),
        },
      })
    )
  );

  const morningShift = await prisma.shift.create({ data: { name: "Morning Shift", startTime: "06:00", endTime: "14:00" } });
  await prisma.shift.create({ data: { name: "Afternoon Shift", startTime: "14:00", endTime: "22:00" } });
  await prisma.shift.create({ data: { name: "Night Shift", startTime: "22:00", endTime: "06:00" } });

  await prisma.shiftAssignment.create({
    data: { employeeId: employees[0].id, shiftId: morningShift.id, date: now },
  });

  await prisma.attendance.create({
    data: { employeeId: employees[0].id, date: now, clockIn: now, status: "PRESENT" },
  });

  await prisma.trainingRecord.create({
    data: {
      employeeId: employees[2].id,
      trainingName: "Lab Safety & Spec Testing Refresher",
      completedDate: now,
      expiryDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
    },
  });

  await prisma.ppeRecord.create({
    data: {
      employeeId: employees[0].id,
      context: "HR",
      items: [{ item: "Helmet", compliant: true }, { item: "Safety Boots", compliant: true }, { item: "Gloves", compliant: true }],
      compliant: true,
      checkedById: hrOfficer.id,
    },
  });

  await prisma.disciplineLog.create({
    data: {
      employeeId: employees[1].id,
      type: "VERBAL_WARNING",
      description: "Late clock-in three times this month",
      actionTaken: "Verbal counselling, monitoring for 30 days",
      recordedById: hrOfficer.id,
    },
  });

  // ── Sales ─────────────────────────────────────────────────────────────
  const customer = await prisma.customer.create({
    data: { name: "AutoParts Lagos Ltd", contactPerson: "Chidi Nnamdi", phone: "+234 802 555 1212", email: "procurement@autopartslagos.com", address: "12 Ikorodu Road, Lagos" },
  });
  await prisma.customer.create({
    data: { name: "Northern Lubricants Distributors", contactPerson: "Aisha Bello", phone: "+234 806 444 3322", address: "Kano Industrial Estate, Kano" },
  });

  await prisma.salesOrder.create({
    data: {
      orderNumber: "SO-20260615-0001",
      customerId: customer.id,
      status: "PENDING",
      createdById: salesOfficer.id,
      items: { create: [{ productId: product.id, quantity: 2000, unitPrice: 1500 }] },
    },
  });

  // A second, already-delivered order so the Deliveries page has data.
  const deliveredBatch = await prisma.batchCard.create({
    data: {
      batchNumber: "BATCH-20260520-0001",
      productId: product.id,
      plannedQty: 2000,
      uom: "L",
      status: "COMPLETED",
      createdById: prodMgr.id,
      startedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000),
    },
  });
  const deliveredFinishedGood = await prisma.finishedGood.create({
    data: {
      productId: product.id,
      batchId: deliveredBatch.id,
      quantity: 2000,
      uom: "L",
      storageLocationId: fgWarehouse.id,
      status: "DISPATCHED",
    },
  });
  const deliveredOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: "SO-20260520-0001",
      customerId: customer.id,
      status: "DELIVERED",
      createdById: salesOfficer.id,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2000,
            unitPrice: 1500,
            batchId: deliveredBatch.id,
            finishedGoodId: deliveredFinishedGood.id,
          },
        ],
      },
    },
  });
  await prisma.deliveryNote.create({
    data: {
      orderId: deliveredOrder.id,
      deliveryNumber: "DN-20260522-0001",
      vehicleNo: "LND-442-XA",
      driverName: "David Okon",
      dispatchedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      status: "CONFIRMED",
    },
  });
  await prisma.customerComplaint.create({
    data: {
      customerId: customer.id,
      orderId: deliveredOrder.id,
      description: "Two drums arrived with damaged seals; customer suspects leakage in transit.",
      status: "IN_PROGRESS",
      handledById: salesOfficer.id,
    },
  });

  // ── Safety ────────────────────────────────────────────────────────────
  await prisma.safetyChecklist.create({
    data: {
      date: now,
      shift: "Morning Shift",
      items: [
        { item: "Fire extinguishers in place", checked: true },
        { item: "Emergency exits clear", checked: true },
        { item: "Spill kits stocked", checked: true },
      ],
      status: "OK",
      checkedById: safetyOfficer.id,
    },
  });

  await prisma.hotWorkPermit.create({
    data: {
      location: "Blending Hall - Vessel 2",
      description: "Welding repair on agitator mount",
      requestedById: prodMgr.id,
      approvedById: safetyOfficer.id,
      status: "APPROVED",
      validFrom: now,
      validTo: in14Days,
    },
  });

  await prisma.lockOutTagOut.create({
    data: {
      equipment: "Filling Line Conveyor 1",
      reason: "Scheduled motor maintenance",
      lockedById: safetyOfficer.id,
      status: "LOCKED",
    },
  });

  const incident = await prisma.safetyIncident.create({
    data: {
      type: "SPILL",
      description: "Minor base oil spill near Tank 3 during offloading",
      location: "Tank Farm",
      severity: "LOW",
      status: "INVESTIGATING",
      reportedById: safetyOfficer.id,
    },
  });

  await prisma.correctiveAction.create({
    data: {
      incidentId: incident.id,
      description: "Install secondary containment tray under offload valve",
      assignedToId: storeMgr.id,
      dueDate: in14Days,
      status: "OPEN",
    },
  });

  await prisma.correctiveAction.create({
    data: {
      ncrId: ncr.id,
      description: "Add additive pump calibration to weekly PM checklist",
      assignedToId: qcOfficer.id,
      status: "COMPLETED",
      completedAt: now,
    },
  });

  await prisma.safetyDrillRecord.create({
    data: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      type: "Fire Evacuation Drill",
      conductedById: safetyOfficer.id,
      attendees: 42,
      notes: "All staff evacuated within target time of 4 minutes.",
    },
  });

  // ── Notifications ─────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: qcOfficer.id,
        title: "Sample request awaiting test",
        message: `Batch ${batch.batchNumber} sample is pending lab test entry.`,
        type: "WARNING",
        link: `/quality/sample-requests`,
      },
      {
        userId: storeMgr.id,
        title: "Lot nearing expiry",
        message: "LOT-ADD-0001 (Additive Package AP-7) expires in 14 days.",
        type: "WARNING",
        link: "/inventory/stock-lots",
      },
      {
        userId: admin.id,
        title: "Welcome to SEGMAX MOMS",
        message: "Your Manufacturing Operations Management System is ready.",
        type: "SUCCESS",
      },
    ],
  });

  console.log("Seed complete.");
  console.log({ ceo: ceo.email, admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
