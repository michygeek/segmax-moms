import {
  AlertTriangle,
  Beaker,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  FlaskConical,
  HardHat,
  PackageCheck,
  ShieldAlert,
  ShoppingCart,
  Users,
} from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  IncidentBreakdownChart,
  InventoryLevelsChart,
  OrderStatusPieChart,
  ProductionTrendChart,
  QcResultPieChart,
} from "@/components/dashboard/charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { canRead, type ModuleKey } from "@/lib/permissions";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { requireUser } from "@/lib/session";

/** Maps an AuditLog `entity` name to the module that governs its visibility. */
const ENTITY_MODULE: Record<string, ModuleKey[]> = {
  BatchCard: ["production"],
  BatchMaterial: ["production"],
  Product: ["production"],
  RawMaterial: ["inventory"],
  StockLot: ["inventory"],
  FinishedGood: ["inventory"],
  StorageLocation: ["inventory"],
  Supplier: ["inventory"],
  QCSampleRequest: ["quality"],
  LabTest: ["quality"],
  NonConformanceReport: ["quality"],
  RetentionSample: ["quality"],
  Employee: ["hr"],
  Attendance: ["hr"],
  Shift: ["hr"],
  ShiftAssignment: ["hr"],
  TrainingRecord: ["hr"],
  DisciplineLog: ["hr"],
  PpeRecord: ["hr", "safety"],
  Customer: ["sales"],
  CustomerComplaint: ["sales"],
  SalesOrder: ["sales"],
  SafetyChecklist: ["safety"],
  HotWorkPermit: ["safety"],
  LockOutTagOut: ["safety"],
  SafetyIncident: ["safety"],
  CorrectiveAction: ["safety"],
  SafetyDrillRecord: ["safety"],
  User: ["admin"],
};

export default async function DashboardPage() {
  const user = await requireUser();
  const isCompanyWide = user.role === "CEO" || user.role === "SUPER_ADMIN";
  const can = (module: ModuleKey) => canRead(user.role, module);

  const { kpis, charts, activity } = await getDashboardSummary();

  const visibleActivity = activity.filter((item) => {
    const modules = ENTITY_MODULE[item.entity];
    return !modules || modules.some((m) => can(m));
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description={
          isCompanyWide
            ? "Company-wide snapshot across production, inventory, quality, sales, and safety."
            : "Snapshot of the modules you have access to."
        }
      />

      {can("production") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Production</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total Batches" value={kpis.totalBatches} icon={Factory} />
            <KpiCard title="In Progress" value={kpis.inProgressBatches} icon={Beaker} tone="warning" />
            <KpiCard title="Completed This Month" value={kpis.completedThisMonth} icon={CheckCircle2} tone="success" />
            <KpiCard title="On Hold" value={kpis.onHoldBatches} icon={AlertTriangle} tone="danger" />
          </div>
        </section>
      )}

      {can("inventory") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Inventory</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard title="Available Raw Material Lots" value={kpis.rawMaterialLots} icon={Boxes} />
            <KpiCard title="Expiring Within 30 Days" value={kpis.expiringSoonLots} icon={AlertTriangle} tone="warning" />
            <KpiCard
              title="Finished Goods (L)"
              value={kpis.finishedGoodsQty.toLocaleString()}
              icon={PackageCheck}
              tone="success"
            />
          </div>
        </section>
      )}

      {can("quality") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Quality</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard title="Pending Sample Requests" value={kpis.pendingSampleRequests} icon={FlaskConical} tone="warning" />
            <KpiCard
              title="QC Pass Rate"
              value={kpis.qcPassRate !== null ? `${kpis.qcPassRate}%` : "—"}
              icon={ClipboardCheck}
              tone="success"
            />
            <KpiCard title="Open NCRs" value={kpis.openNCRs} icon={AlertTriangle} tone="danger" />
          </div>
        </section>
      )}

      {can("sales") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Sales & Distribution</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard title="Pending Orders" value={kpis.pendingOrders} icon={ShoppingCart} tone="warning" />
            <KpiCard title="Orders This Month" value={kpis.ordersThisMonth} icon={ShoppingCart} />
            <KpiCard title="Open Complaints" value={kpis.openComplaints} icon={AlertTriangle} tone="danger" />
          </div>
        </section>
      )}

      {can("safety") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Safety</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard title="Open Incidents" value={kpis.openIncidents} icon={ShieldAlert} tone="danger" />
            <KpiCard title="Active Hot Work Permits" value={kpis.activePermits} icon={HardHat} tone="warning" />
          </div>
        </section>
      )}

      {can("hr") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">HR</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard title="Total Employees" value={kpis.totalEmployees} icon={Users} />
            <KpiCard title="Present Today" value={kpis.presentToday} icon={CheckCircle2} tone="success" />
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        {can("production") && <ProductionTrendChart data={charts.productionTrend} />}
        {can("inventory") && <InventoryLevelsChart data={charts.inventoryLevels} />}
        {can("quality") && <QcResultPieChart data={charts.labTestBreakdown} />}
        {can("safety") && <IncidentBreakdownChart data={charts.incidentBreakdown} />}
        {can("sales") && <OrderStatusPieChart data={charts.orderStatusBreakdown} />}
        <ActivityFeed items={visibleActivity} />
      </section>
    </div>
  );
}
