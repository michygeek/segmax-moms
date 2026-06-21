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
import { getDashboardSummary } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const { kpis, charts, activity } = await getDashboardSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Company-wide snapshot across production, inventory, quality, sales, and safety."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Production</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Batches" value={kpis.totalBatches} icon={Factory} />
          <KpiCard title="In Progress" value={kpis.inProgressBatches} icon={Beaker} tone="warning" />
          <KpiCard title="Completed This Month" value={kpis.completedThisMonth} icon={CheckCircle2} tone="success" />
          <KpiCard title="On Hold" value={kpis.onHoldBatches} icon={AlertTriangle} tone="danger" />
        </div>
      </section>

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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Sales & Distribution</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard title="Pending Orders" value={kpis.pendingOrders} icon={ShoppingCart} tone="warning" />
          <KpiCard title="Orders This Month" value={kpis.ordersThisMonth} icon={ShoppingCart} />
          <KpiCard title="Open Complaints" value={kpis.openComplaints} icon={AlertTriangle} tone="danger" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Safety & HR</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Open Incidents" value={kpis.openIncidents} icon={ShieldAlert} tone="danger" />
          <KpiCard title="Active Hot Work Permits" value={kpis.activePermits} icon={HardHat} tone="warning" />
          <KpiCard title="Total Employees" value={kpis.totalEmployees} icon={Users} />
          <KpiCard title="Present Today" value={kpis.presentToday} icon={CheckCircle2} tone="success" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ProductionTrendChart data={charts.productionTrend} />
        <InventoryLevelsChart data={charts.inventoryLevels} />
        <QcResultPieChart data={charts.labTestBreakdown} />
        <IncidentBreakdownChart data={charts.incidentBreakdown} />
        <OrderStatusPieChart data={charts.orderStatusBreakdown} />
        <ActivityFeed items={activity} />
      </section>
    </div>
  );
}
