import { prisma } from "@/lib/prisma";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export async function getDashboardSummary() {
  const monthStart = startOfMonth();
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [
    totalBatches,
    inProgressBatches,
    completedThisMonth,
    onHoldBatches,
    rawMaterialLots,
    expiringSoonLots,
    finishedGoodsAgg,
    pendingSampleRequests,
    recentLabTests,
    openNCRs,
    pendingOrders,
    ordersThisMonth,
    openComplaints,
    openIncidents,
    activePermits,
    totalEmployees,
    presentToday,
    recentAuditLogs,
    productionByDay,
    rawMaterialLevels,
    incidentsByType,
    orderStatusGroups,
  ] = await Promise.all([
    prisma.batchCard.count(),
    prisma.batchCard.count({
      where: { status: { notIn: ["COMPLETED", "REJECTED", "ON_HOLD"] } },
    }),
    prisma.batchCard.count({
      where: { status: "COMPLETED", completedAt: { gte: monthStart } },
    }),
    prisma.batchCard.count({ where: { status: "ON_HOLD" } }),
    prisma.stockLot.count({ where: { status: "AVAILABLE" } }),
    prisma.stockLot.count({
      where: { status: "AVAILABLE", expiryDate: { lte: in30Days, gte: new Date() } },
    }),
    prisma.finishedGood.aggregate({ _sum: { quantity: true } }),
    prisma.qCSampleRequest.count({ where: { status: "PENDING" } }),
    prisma.labTest.findMany({
      orderBy: { testedAt: "desc" },
      take: 20,
      select: { result: true },
    }),
    prisma.nonConformanceReport.count({ where: { status: { not: "CLOSED" } } }),
    prisma.salesOrder.count({ where: { status: "PENDING" } }),
    prisma.salesOrder.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.customerComplaint.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.safetyIncident.count({ where: { status: { not: "CLOSED" } } }),
    prisma.hotWorkPermit.count({ where: { status: "APPROVED" } }),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.attendance.count({ where: { date: { gte: todayStart }, status: "PRESENT" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.batchCard.findMany({
      where: { createdAt: { gte: daysAgo(14) } },
      select: { createdAt: true, status: true },
    }),
    prisma.rawMaterial.findMany({
      include: { stockLots: { where: { status: "AVAILABLE" }, select: { quantityRemaining: true } } },
      take: 8,
    }),
    prisma.safetyIncident.groupBy({ by: ["type"], _count: { type: true } }),
    prisma.salesOrder.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const passCount = recentLabTests.filter((t) => t.result === "PASS").length;
  const failCount = recentLabTests.filter((t) => t.result === "FAIL").length;
  const holdCount = recentLabTests.filter((t) => t.result === "HOLD").length;
  const qcPassRate =
    recentLabTests.length > 0 ? Math.round((passCount / recentLabTests.length) * 100) : null;

  const productionTrendMap = new Map<string, number>();
  for (const b of productionByDay) {
    const key = b.createdAt.toISOString().slice(0, 10);
    productionTrendMap.set(key, (productionTrendMap.get(key) ?? 0) + 1);
  }
  const productionTrend = Array.from(productionTrendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const inventoryLevels = rawMaterialLevels.map((rm) => ({
    name: rm.name,
    quantity: rm.stockLots.reduce((sum, l) => sum + l.quantityRemaining, 0),
  }));

  const incidentBreakdown = incidentsByType.map((i) => ({
    type: i.type,
    count: i._count.type,
  }));

  const labTestBreakdown = [
    { name: "Pass", value: passCount },
    { name: "Fail", value: failCount },
    { name: "Hold", value: holdCount },
  ];

  const orderStatusBreakdown = orderStatusGroups.map((o) => ({
    status: o.status,
    count: o._count.status,
  }));

  return {
    kpis: {
      totalBatches,
      inProgressBatches,
      completedThisMonth,
      onHoldBatches,
      rawMaterialLots,
      expiringSoonLots,
      finishedGoodsQty: finishedGoodsAgg._sum.quantity ?? 0,
      pendingSampleRequests,
      qcPassRate,
      openNCRs,
      pendingOrders,
      ordersThisMonth,
      openComplaints,
      openIncidents,
      activePermits,
      totalEmployees,
      presentToday,
    },
    charts: {
      productionTrend,
      inventoryLevels,
      incidentBreakdown,
      labTestBreakdown,
      orderStatusBreakdown,
    },
    activity: recentAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      userName: log.user?.name ?? "System",
      createdAt: log.createdAt,
    })),
  };
}
