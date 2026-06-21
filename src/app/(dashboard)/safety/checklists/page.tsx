import { ChecklistsTable } from "@/app/(dashboard)/safety/checklists/checklists-table";
import { canWrite } from "@/lib/permissions";
import { listChecklists } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function ChecklistsPage() {
  const user = await requireUser();
  const checklists = await listChecklists();

  return <ChecklistsTable checklists={checklists} canWrite={canWrite(user.role, "safety")} />;
}
