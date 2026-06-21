import { ComplaintsTable } from "@/app/(dashboard)/sales/complaints/complaints-table";
import { canWrite } from "@/lib/permissions";
import { listComplaints, listCustomers, listOrders } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";

export default async function ComplaintsPage() {
  const user = await requireUser();
  const [complaints, customers, orders] = await Promise.all([listComplaints(), listCustomers(), listOrders()]);

  return (
    <ComplaintsTable
      complaints={complaints}
      customers={customers}
      orders={orders.map((o) => ({ id: o.id, orderNumber: o.orderNumber }))}
      canWrite={canWrite(user.role, "sales")}
    />
  );
}
