import { RawMaterialsTable } from "@/app/(dashboard)/inventory/raw-materials/raw-materials-table";
import { canWrite } from "@/lib/permissions";
import { listRawMaterialsWithStock } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";

export default async function RawMaterialsPage() {
  const user = await requireUser();
  const rawMaterials = await listRawMaterialsWithStock();

  return <RawMaterialsTable rawMaterials={rawMaterials} canWrite={canWrite(user.role, "inventory")} />;
}
