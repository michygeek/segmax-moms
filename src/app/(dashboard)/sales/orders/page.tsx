import { OrdersTable } from "@/app/(dashboard)/sales/orders/orders-table";
import { canWrite } from "@/lib/permissions";
import { listOrders } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listOrders();

  return <OrdersTable orders={orders} canWrite={canWrite(user.role, "sales")} />;
}
