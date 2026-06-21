import { IncidentsTable } from "@/app/(dashboard)/safety/incidents/incidents-table";
import { canWrite } from "@/lib/permissions";
import { listIncidents } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function IncidentsPage() {
  const user = await requireUser();
  const incidents = await listIncidents();

  return <IncidentsTable incidents={incidents} canWrite={canWrite(user.role, "safety")} />;
}
