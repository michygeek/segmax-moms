import { CustomersTable } from "@/app/(dashboard)/sales/customers/customers-table";
import { canWrite } from "@/lib/permissions";
import { listCustomers } from "@/lib/services/sales";
import { requireUser } from "@/lib/session";

export default async function CustomersPage() {
  const user = await requireUser();
  const customers = await listCustomers();

  return <CustomersTable customers={customers} canWrite={canWrite(user.role, "sales")} />;
}
