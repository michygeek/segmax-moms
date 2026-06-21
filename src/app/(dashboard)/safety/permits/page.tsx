import { PermitsTable } from "@/app/(dashboard)/safety/permits/permits-table";
import { canWrite } from "@/lib/permissions";
import { listPermits } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function PermitsPage() {
  const user = await requireUser();
  const permits = await listPermits();

  return <PermitsTable permits={permits} canWrite={canWrite(user.role, "safety")} />;
}
