import { NewOrderForm } from "@/app/(dashboard)/sales/orders/new/new-order-form";
import { listProducts } from "@/lib/services/production";
import { listCustomers } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";

export default async function NewOrderPage() {
  await requireUser();
  const [customers, products] = await Promise.all([listCustomers(), listProducts()]);

  return <NewOrderForm customers={customers} products={products.filter((p) => p.isActive)} />;
}
