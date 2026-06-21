import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  FlaskConical,
  Gauge,
  HardHat,
  LayoutDashboard,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

import type { ModuleKey } from "@/lib/permissions";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  module: ModuleKey;
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    module: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ title: "Executive Dashboard", href: "/dashboard", icon: Gauge }],
  },
  {
    module: "production",
    title: "Production",
    icon: Gauge,
    items: [
      { title: "Batches", href: "/production/batches", icon: Gauge },
      { title: "Products", href: "/production/products", icon: Gauge },
    ],
  },
  {
    module: "inventory",
    title: "Inventory",
    icon: Boxes,
    items: [
      { title: "Raw Materials", href: "/inventory/raw-materials", icon: Boxes },
      { title: "Stock Lots (FIFO)", href: "/inventory/stock-lots", icon: Boxes },
      { title: "Finished Goods", href: "/inventory/finished-goods", icon: Boxes },
      { title: "Storage Locations", href: "/inventory/locations", icon: Boxes },
      { title: "Suppliers", href: "/inventory/suppliers", icon: Boxes },
      { title: "Stock Movements", href: "/inventory/movements", icon: Boxes },
    ],
  },
  {
    module: "quality",
    title: "Quality Control",
    icon: FlaskConical,
    items: [
      { title: "Sample Requests", href: "/quality/sample-requests", icon: FlaskConical },
      { title: "Non-Conformance Reports", href: "/quality/ncr", icon: FlaskConical },
      { title: "Retention Samples", href: "/quality/retention-samples", icon: FlaskConical },
    ],
  },
  {
    module: "hr",
    title: "Human Resources",
    icon: Users,
    items: [
      { title: "Employees", href: "/hr/employees", icon: Users },
      { title: "Attendance", href: "/hr/attendance", icon: Users },
      { title: "Shifts", href: "/hr/shifts", icon: Users },
      { title: "Training Records", href: "/hr/training", icon: Users },
      { title: "PPE Compliance", href: "/hr/ppe", icon: Users },
      { title: "Discipline Log", href: "/hr/discipline", icon: Users },
    ],
  },
  {
    module: "sales",
    title: "Sales & Distribution",
    icon: ShoppingCart,
    items: [
      { title: "Customers", href: "/sales/customers", icon: ShoppingCart },
      { title: "Sales Orders", href: "/sales/orders", icon: ShoppingCart },
      { title: "Deliveries", href: "/sales/deliveries", icon: ShoppingCart },
      { title: "Complaints", href: "/sales/complaints", icon: ShoppingCart },
    ],
  },
  {
    module: "safety",
    title: "Safety",
    icon: HardHat,
    items: [
      { title: "Daily Checklists", href: "/safety/checklists", icon: HardHat },
      { title: "PPE Check-in", href: "/safety/ppe-checkins", icon: HardHat },
      { title: "Hot Work Permits", href: "/safety/permits", icon: HardHat },
      { title: "Lock Out / Tag Out", href: "/safety/lotos", icon: HardHat },
      { title: "Incidents", href: "/safety/incidents", icon: HardHat },
      { title: "Corrective Actions", href: "/safety/corrective-actions", icon: HardHat },
      { title: "Drill Records", href: "/safety/drills", icon: HardHat },
    ],
  },
  {
    module: "admin",
    title: "Administration",
    icon: ShieldCheck,
    items: [
      { title: "Users", href: "/admin/users", icon: ShieldCheck },
      { title: "Audit Log", href: "/admin/audit-log", icon: ShieldCheck },
    ],
  },
];

export const ROLE_LABELS: Record<string, string> = {
  CEO: "CEO",
  SUPER_ADMIN: "Super Admin",
  PRODUCTION_MANAGER: "Production Manager",
  STORE_MANAGER: "Store Manager",
  QC_OFFICER: "QC Officer",
  HR_OFFICER: "HR Officer",
  SALES_OFFICER: "Sales Officer",
  SAFETY_OFFICER: "Safety Officer",
};
