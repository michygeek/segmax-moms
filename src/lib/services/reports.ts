import { prisma } from "@/lib/prisma";

export const REPORT_TYPES = [
  { value: "production", label: "Production Batches" },
  { value: "inventory", label: "Inventory Stock Movements" },
  { value: "sales", label: "Sales Orders" },
  { value: "quality", label: "QC Lab Tests" },
  { value: "safety", label: "Safety Incidents" },
  { value: "hr", label: "HR Attendance" },
] as const;

export type ReportType = (typeof REPORT_TYPES)[number]["value"];

type DateRange = { from: Date; to: Date };

export const REPORT_COLUMNS = {
  production: [
    { key: "batchNumber", label: "Batch Number" },
    { key: "product", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "plannedQty", label: "Planned Qty" },
    { key: "uom", label: "UOM" },
    { key: "status", label: "Status" },
    { key: "createdBy", label: "Created By" },
    { key: "createdAt", label: "Created At" },
    { key: "completedAt", label: "Completed At" },
  ],
  inventory: [
    { key: "createdAt", label: "Date" },
    { key: "itemType", label: "Item Type" },
    { key: "item", label: "Item" },
    { key: "type", label: "Movement Type" },
    { key: "quantity", label: "Quantity" },
    { key: "fromLocation", label: "From" },
    { key: "toLocation", label: "To" },
    { key: "reference", label: "Reference" },
    { key: "user", label: "User" },
  ],
  sales: [
    { key: "orderNumber", label: "Order Number" },
    { key: "customer", label: "Customer" },
    { key: "status", label: "Status" },
    { key: "total", label: "Total" },
    { key: "createdBy", label: "Created By" },
    { key: "createdAt", label: "Created At" },
  ],
  quality: [
    { key: "batchNumber", label: "Batch Number" },
    { key: "result", label: "Result" },
    { key: "testedBy", label: "Tested By" },
    { key: "testedAt", label: "Tested At" },
    { key: "remarks", label: "Remarks" },
  ],
  safety: [
    { key: "type", label: "Type" },
    { key: "severity", label: "Severity" },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
    { key: "description", label: "Description" },
    { key: "reportedBy", label: "Reported By" },
    { key: "createdAt", label: "Reported At" },
  ],
  hr: [
    { key: "employee", label: "Employee" },
    { key: "employeeCode", label: "Employee Code" },
    { key: "department", label: "Department" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "clockIn", label: "Clock In" },
    { key: "clockOut", label: "Clock Out" },
  ],
} as const;

async function productionReport({ from, to }: DateRange) {
  const rows = await prisma.batchCard.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "asc" },
    include: { product: { select: { name: true, sku: true } }, createdBy: { select: { name: true } } },
  });
  return rows.map((b) => ({
    batchNumber: b.batchNumber,
    product: b.product.name,
    sku: b.product.sku,
    plannedQty: b.plannedQty,
    uom: b.uom,
    status: b.status,
    createdBy: b.createdBy.name,
    createdAt: b.createdAt,
    completedAt: b.completedAt,
  }));
}

async function inventoryReport({ from, to }: DateRange) {
  const rows = await prisma.stockMovement.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "asc" },
    include: {
      stockLot: { select: { lotNumber: true, rawMaterial: { select: { name: true } } } },
      finishedGood: { select: { product: { select: { name: true } } } },
      user: { select: { name: true } },
    },
  });
  return rows.map((m) => ({
    createdAt: m.createdAt,
    itemType: m.itemType,
    item: m.stockLot
      ? `${m.stockLot.rawMaterial.name} (${m.stockLot.lotNumber})`
      : (m.finishedGood?.product.name ?? ""),
    type: m.type,
    quantity: m.quantity,
    fromLocation: m.fromLocation,
    toLocation: m.toLocation,
    reference: m.reference,
    user: m.user.name,
  }));
}

async function salesReport({ from, to }: DateRange) {
  const rows = await prisma.salesOrder.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "asc" },
    include: {
      customer: { select: { name: true } },
      createdBy: { select: { name: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
  });
  return rows.map((o) => ({
    orderNumber: o.orderNumber,
    customer: o.customer.name,
    status: o.status,
    total: o.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    createdBy: o.createdBy.name,
    createdAt: o.createdAt,
  }));
}

async function qualityReport({ from, to }: DateRange) {
  const rows = await prisma.labTest.findMany({
    where: { testedAt: { gte: from, lte: to } },
    orderBy: { testedAt: "asc" },
    include: { batch: { select: { batchNumber: true } }, testedBy: { select: { name: true } } },
  });
  return rows.map((t) => ({
    batchNumber: t.batch.batchNumber,
    result: t.result,
    testedBy: t.testedBy.name,
    testedAt: t.testedAt,
    remarks: t.remarks,
  }));
}

async function safetyReport({ from, to }: DateRange) {
  const rows = await prisma.safetyIncident.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "asc" },
    include: { reportedBy: { select: { name: true } } },
  });
  return rows.map((i) => ({
    type: i.type,
    severity: i.severity,
    status: i.status,
    location: i.location,
    description: i.description,
    reportedBy: i.reportedBy.name,
    createdAt: i.createdAt,
  }));
}

async function hrReport({ from, to }: DateRange) {
  const rows = await prisma.attendance.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
    include: { employee: { select: { fullName: true, employeeCode: true, department: true } } },
  });
  return rows.map((a) => ({
    employee: a.employee.fullName,
    employeeCode: a.employee.employeeCode,
    department: a.employee.department,
    date: a.date,
    status: a.status,
    clockIn: a.clockIn,
    clockOut: a.clockOut,
  }));
}

export async function getReportRows(type: ReportType, range: DateRange) {
  switch (type) {
    case "production":
      return productionReport(range);
    case "inventory":
      return inventoryReport(range);
    case "sales":
      return salesReport(range);
    case "quality":
      return qualityReport(range);
    case "safety":
      return safetyReport(range);
    case "hr":
      return hrReport(range);
  }
}
