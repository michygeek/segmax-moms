import { FinishedGoodsTable } from "@/app/(dashboard)/inventory/finished-goods/finished-goods-table";
import { canWrite } from "@/lib/permissions";
import { listFinishedGoods, listStorageLocations } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";

export default async function FinishedGoodsPage() {
  const user = await requireUser();
  const [finishedGoods, storageLocations] = await Promise.all([
    listFinishedGoods(),
    listStorageLocations(),
  ]);

  return (
    <FinishedGoodsTable
      finishedGoods={finishedGoods}
      storageLocations={storageLocations.filter((l) => l.type === "FINISHED_GOODS")}
      canWrite={canWrite(user.role, "inventory")}
    />
  );
}
