import { BatchesTable } from "@/app/(dashboard)/production/batches/batches-table";
import { canWrite } from "@/lib/permissions";
import { listBatches } from "@/lib/services/production";
import { requireUser } from "@/lib/session";

export default async function BatchesPage() {
  const user = await requireUser();
  const batches = await listBatches();

  return <BatchesTable batches={batches} canWrite={canWrite(user.role, "production")} />;
}
