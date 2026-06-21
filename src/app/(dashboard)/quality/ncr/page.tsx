import { NcrTable } from "@/app/(dashboard)/quality/ncr/ncr-table";
import { canWrite } from "@/lib/permissions";
import { listNcrs, listRecentBatchesForSelect } from "@/lib/services/quality";
import { requireUser } from "@/lib/session";

export default async function NcrPage() {
  const user = await requireUser();
  const [ncrs, batches] = await Promise.all([listNcrs(), listRecentBatchesForSelect()]);

  return <NcrTable ncrs={ncrs} batches={batches} canWrite={canWrite(user.role, "quality")} />;
}
