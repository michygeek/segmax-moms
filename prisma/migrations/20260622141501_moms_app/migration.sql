-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CEO', 'SUPER_ADMIN', 'PRODUCTION_MANAGER', 'STORE_MANAGER', 'QC_OFFICER', 'HR_OFFICER', 'SALES_OFFICER', 'SAFETY_OFFICER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('DRAFT', 'MATERIALS_VERIFIED', 'IN_BLENDING', 'LAB_TEST_PENDING', 'ADJUSTMENT', 'FILTERING', 'FILLING', 'BADGING', 'PACKAGING', 'STORED', 'COMPLETED', 'ON_HOLD', 'REJECTED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('RAW_MATERIAL', 'FINISHED_GOODS');

-- CreateEnum
CREATE TYPE "StockLotStatus" AS ENUM ('AVAILABLE', 'QUARANTINED', 'CONSUMED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FinishedGoodStatus" AS ENUM ('IN_STORAGE', 'ALLOCATED', 'DISPATCHED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT', 'DISPATCH');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('PENDING', 'TESTED');

-- CreateEnum
CREATE TYPE "LabTestResult" AS ENUM ('PASS', 'FAIL', 'HOLD');

-- CreateEnum
CREATE TYPE "NCRStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "PpeContext" AS ENUM ('HR', 'SAFETY');

-- CreateEnum
CREATE TYPE "DisciplineType" AS ENUM ('VERBAL_WARNING', 'WRITTEN_WARNING', 'SUSPENSION', 'TERMINATION', 'COMMENDATION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'BATCH_MATCHED', 'PICKED_PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DISPATCHED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LotoStatus" AS ENUM ('LOCKED', 'UNLOCKED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('SPILL', 'INJURY', 'NEAR_MISS', 'FIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'CLOSED');

-- CreateEnum
CREATE TYPE "CorrectiveActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT,
    "uom" TEXT NOT NULL,
    "specSheet" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchCard" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "uom" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchMaterial" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "stockLotId" TEXT,
    "qtyPlanned" DOUBLE PRECISION NOT NULL,
    "qtyUsed" DOUBLE PRECISION,
    "uom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionLog" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "stage" "BatchStatus" NOT NULL,
    "note" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "reorderLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "capacity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "supplierId" TEXT,
    "quantityReceived" DOUBLE PRECISION NOT NULL,
    "quantityRemaining" DOUBLE PRECISION NOT NULL,
    "uom" TEXT NOT NULL,
    "coaUrl" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "storageLocationId" TEXT,
    "status" "StockLotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishedGood" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "uom" TEXT NOT NULL,
    "storageLocationId" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" "FinishedGoodStatus" NOT NULL DEFAULT 'IN_STORAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinishedGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "stockLotId" TEXT,
    "finishedGoodId" TEXT,
    "type" "MovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "reference" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCSampleRequest" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" "SampleStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCSampleRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "sampleRequestId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "testedById" TEXT NOT NULL,
    "result" "LabTestResult" NOT NULL,
    "remarks" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestParameterResult" (
    "id" TEXT NOT NULL,
    "labTestId" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "unit" TEXT,
    "specMin" DOUBLE PRECISION,
    "specMax" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,

    CONSTRAINT "TestParameterResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NonConformanceReport" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "description" TEXT NOT NULL,
    "rootCause" TEXT,
    "correctiveAction" TEXT,
    "status" "NCRStatus" NOT NULL DEFAULT 'OPEN',
    "raisedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "NonConformanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionSample" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "retainedUntil" TIMESTAMP(3) NOT NULL,
    "disposed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetentionSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "phone" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "handoverNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingName" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpeRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "context" "PpeContext" NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "items" JSONB NOT NULL,
    "compliant" BOOLEAN NOT NULL,
    "checkedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PpeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "DisciplineType" NOT NULL,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "batchId" TEXT,
    "finishedGoodId" TEXT,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryNote" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryNumber" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "driverName" TEXT,
    "dispatchedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerComplaint" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "handledById" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyChecklist" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" TEXT,
    "items" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OK',
    "checkedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotWorkPermit" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "status" "PermitStatus" NOT NULL DEFAULT 'REQUESTED',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotWorkPermit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockOutTagOut" (
    "id" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "lockedById" TEXT NOT NULL,
    "unlockedById" TEXT,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedAt" TIMESTAMP(3),
    "status" "LotoStatus" NOT NULL DEFAULT 'LOCKED',

    CONSTRAINT "LockOutTagOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyIncident" (
    "id" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'LOW',
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "reportedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT,
    "ncrId" TEXT,
    "description" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "CorrectiveActionStatus" NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyDrillRecord" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "conductedById" TEXT NOT NULL,
    "attendees" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyDrillRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "BatchCard_batchNumber_key" ON "BatchCard"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_code_key" ON "RawMaterial"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StockLot_lotNumber_key" ON "StockLot"("lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_sampleRequestId_key" ON "LabTest"("sampleRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftAssignment_employeeId_date_key" ON "ShiftAssignment"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryNote_orderId_key" ON "DeliveryNote"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryNote_deliveryNumber_key" ON "DeliveryNote"("deliveryNumber");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCard" ADD CONSTRAINT "BatchCard_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCard" ADD CONSTRAINT "BatchCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMaterial" ADD CONSTRAINT "BatchMaterial_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMaterial" ADD CONSTRAINT "BatchMaterial_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMaterial" ADD CONSTRAINT "BatchMaterial_stockLotId_fkey" FOREIGN KEY ("stockLotId") REFERENCES "StockLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionLog" ADD CONSTRAINT "ProductionLog_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionLog" ADD CONSTRAINT "ProductionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGood" ADD CONSTRAINT "FinishedGood_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_stockLotId_fkey" FOREIGN KEY ("stockLotId") REFERENCES "StockLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCSampleRequest" ADD CONSTRAINT "QCSampleRequest_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCSampleRequest" ADD CONSTRAINT "QCSampleRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "QCSampleRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_testedById_fkey" FOREIGN KEY ("testedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestParameterResult" ADD CONSTRAINT "TestParameterResult_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformanceReport" ADD CONSTRAINT "NonConformanceReport_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformanceReport" ADD CONSTRAINT "NonConformanceReport_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionSample" ADD CONSTRAINT "RetentionSample_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PpeRecord" ADD CONSTRAINT "PpeRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PpeRecord" ADD CONSTRAINT "PpeRecord_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineLog" ADD CONSTRAINT "DisciplineLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BatchCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_finishedGoodId_fkey" FOREIGN KEY ("finishedGoodId") REFERENCES "FinishedGood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNote" ADD CONSTRAINT "DeliveryNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComplaint" ADD CONSTRAINT "CustomerComplaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComplaint" ADD CONSTRAINT "CustomerComplaint_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComplaint" ADD CONSTRAINT "CustomerComplaint_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyChecklist" ADD CONSTRAINT "SafetyChecklist_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotWorkPermit" ADD CONSTRAINT "HotWorkPermit_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotWorkPermit" ADD CONSTRAINT "HotWorkPermit_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockOutTagOut" ADD CONSTRAINT "LockOutTagOut_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockOutTagOut" ADD CONSTRAINT "LockOutTagOut_unlockedById_fkey" FOREIGN KEY ("unlockedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyIncident" ADD CONSTRAINT "SafetyIncident_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "SafetyIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_ncrId_fkey" FOREIGN KEY ("ncrId") REFERENCES "NonConformanceReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyDrillRecord" ADD CONSTRAINT "SafetyDrillRecord_conductedById_fkey" FOREIGN KEY ("conductedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
