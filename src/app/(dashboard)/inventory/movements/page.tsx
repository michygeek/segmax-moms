import { MovementsTable } from "@/app/(dashboard)/inventory/movements/movements-table";
import { listStockMovements } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";

export default async function MovementsPage() {
  await requireUser();
  const movements = await listStockMovements();

  return <MovementsTable movements={movements} />;
}
