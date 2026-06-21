import { RetentionSamplesTable } from "@/app/(dashboard)/quality/retention-samples/retention-samples-table";
import { canWrite } from "@/lib/permissions";
import { listRecentBatchesForSelect, listRetentionSamples } from "@/lib/services/quality";
import { requireUser } from "@/lib/session";

export default async function RetentionSamplesPage() {
  const user = await requireUser();
  const [samples, batches] = await Promise.all([
    listRetentionSamples(),
    listRecentBatchesForSelect(),
  ]);

  return (
    <RetentionSamplesTable
      samples={samples}
      batches={batches}
      canWrite={canWrite(user.role, "quality")}
    />
  );
}
