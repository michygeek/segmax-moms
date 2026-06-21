import { DeliveriesTable } from "@/app/(dashboard)/sales/deliveries/deliveries-table";
import { listDeliveries } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";

export default async function DeliveriesPage() {
  await requireUser();
  const deliveries = await listDeliveries();

  return <DeliveriesTable deliveries={deliveries} />;
}
