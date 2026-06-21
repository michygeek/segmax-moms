import { StockLotsTable } from "@/app/(dashboard)/inventory/stock-lots/stock-lots-table";
import { canWrite } from "@/lib/permissions";
import {
  listRawMaterials,
  listStockLots,
  listStorageLocations,
  listSuppliers,
} from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";

export default async function StockLotsPage() {
  const user = await requireUser();
  const [lots, rawMaterials, suppliers, storageLocations] = await Promise.all([
    listStockLots(),
    listRawMaterials(),
    listSuppliers(),
    listStorageLocations(),
  ]);

  return (
    <StockLotsTable
      lots={lots}
      rawMaterials={rawMaterials}
      suppliers={suppliers}
      storageLocations={storageLocations.filter((l) => l.type === "RAW_MATERIAL")}
      canWrite={canWrite(user.role, "inventory")}
    />
  );
}
