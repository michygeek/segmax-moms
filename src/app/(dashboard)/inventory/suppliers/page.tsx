import { SuppliersTable } from "@/app/(dashboard)/inventory/suppliers/suppliers-table";
import { canWrite } from "@/lib/permissions";
import { listSuppliers } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";

export default async function SuppliersPage() {
  const user = await requireUser();
  const suppliers = await listSuppliers();

  return <SuppliersTable suppliers={suppliers} canWrite={canWrite(user.role, "inventory")} />;
}
