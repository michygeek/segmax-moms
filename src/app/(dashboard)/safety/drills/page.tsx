import { DrillsTable } from "@/app/(dashboard)/safety/drills/drills-table";
import { canWrite } from "@/lib/permissions";
import { listDrills } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function DrillsPage() {
  const user = await requireUser();
  const drills = await listDrills();

  return <DrillsTable drills={drills} canWrite={canWrite(user.role, "safety")} />;
}
