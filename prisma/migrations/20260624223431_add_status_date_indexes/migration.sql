-- CreateIndex
CREATE INDEX "BatchCard_status_idx" ON "BatchCard"("status");

-- CreateIndex
CREATE INDEX "BatchCard_createdAt_idx" ON "BatchCard"("createdAt");

-- CreateIndex
CREATE INDEX "CustomerComplaint_status_idx" ON "CustomerComplaint"("status");

-- CreateIndex
CREATE INDEX "FinishedGood_status_idx" ON "FinishedGood"("status");

-- CreateIndex
CREATE INDEX "HotWorkPermit_status_idx" ON "HotWorkPermit"("status");

-- CreateIndex
CREATE INDEX "NonConformanceReport_status_idx" ON "NonConformanceReport"("status");

-- CreateIndex
CREATE INDEX "SafetyIncident_status_idx" ON "SafetyIncident"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_createdAt_idx" ON "SalesOrder"("createdAt");

-- CreateIndex
CREATE INDEX "StockLot_status_expiryDate_idx" ON "StockLot"("status", "expiryDate");
