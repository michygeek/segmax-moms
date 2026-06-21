import { SampleRequestsTable } from "@/app/(dashboard)/quality/sample-requests/sample-requests-table";
import { canWrite } from "@/lib/permissions";
import { listSampleRequests } from "@/lib/services/quality";
import { requireUser } from "@/lib/session";

export default async function SampleRequestsPage() {
  const user = await requireUser();
  const sampleRequests = await listSampleRequests();

  return (
    <SampleRequestsTable
      sampleRequests={sampleRequests}
      canWrite={canWrite(user.role, "quality")}
    />
  );
}
