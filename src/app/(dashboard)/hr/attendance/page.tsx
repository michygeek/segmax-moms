import { AttendanceTable } from "@/app/(dashboard)/hr/attendance/attendance-table";
import { canWrite } from "@/lib/permissions";
import { listActiveEmployees, listAttendance } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";

export default async function AttendancePage() {
  const user = await requireUser();
  const [records, employees] = await Promise.all([listAttendance(), listActiveEmployees()]);

  return <AttendanceTable records={records} employees={employees} canWrite={canWrite(user.role, "hr")} />;
}
