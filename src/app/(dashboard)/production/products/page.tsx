import { ProductsTable } from "@/app/(dashboard)/production/products/products-table";
import { canWrite } from "@/lib/permissions";
import { listProducts } from "@/lib/services/production";
import { requireUser } from "@/lib/session";

export default async function ProductsPage() {
  const user = await requireUser();
  const products = await listProducts();

  return <ProductsTable products={products} canWrite={canWrite(user.role, "production")} />;
}
