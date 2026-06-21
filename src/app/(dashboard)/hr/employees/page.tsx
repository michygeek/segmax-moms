import { EmployeesTable } from "@/app/(dashboard)/hr/employees/employees-table";
import { canWrite } from "@/lib/permissions";
import { listEmployees } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";

export default async function EmployeesPage() {
  const user = await requireUser();
  const employees = await listEmployees();

  return <EmployeesTable employees={employees} canWrite={canWrite(user.role, "hr")} />;
}
