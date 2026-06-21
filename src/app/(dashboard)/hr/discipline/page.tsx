import { DisciplineTable } from "@/app/(dashboard)/hr/discipline/discipline-table";
import { canWrite } from "@/lib/permissions";
import { listActiveEmployees, listDisciplineLogs } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";

export default async function DisciplinePage() {
  const user = await requireUser();
  const [logs, employees] = await Promise.all([listDisciplineLogs(), listActiveEmployees()]);

  return <DisciplineTable logs={logs} employees={employees} canWrite={canWrite(user.role, "hr")} />;
}
