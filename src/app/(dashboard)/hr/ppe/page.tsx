import { PpeTable } from "@/app/(dashboard)/hr/ppe/ppe-table";
import { canWrite } from "@/lib/permissions";
import { listActiveEmployees, listHrPpeRecords } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";

export default async function PpePage() {
  const user = await requireUser();
  const [records, employees] = await Promise.all([listHrPpeRecords(), listActiveEmployees()]);

  return <PpeTable records={records} employees={employees} canWrite={canWrite(user.role, "hr")} />;
}
