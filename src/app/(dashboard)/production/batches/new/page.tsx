import { NewBatchForm } from "@/app/(dashboard)/production/batches/new/new-batch-form";
import { listRawMaterials } from "@/lib/services/inventory";
import { listProducts } from "@/lib/services/production";
import { requireUser } from "@/lib/session";

export default async function NewBatchPage() {
  await requireUser();
  const [products, rawMaterials] = await Promise.all([listProducts(), listRawMaterials()]);

  return <NewBatchForm products={products.filter((p) => p.isActive)} rawMaterials={rawMaterials} />;
}
