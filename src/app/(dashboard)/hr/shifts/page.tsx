import { ShiftsClient } from "@/app/(dashboard)/hr/shifts/shifts-client";
import { canWrite } from "@/lib/permissions";
import { listActiveEmployees, listShiftAssignments, listShifts } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";

export default async function ShiftsPage() {
  const user = await requireUser();
  const [shifts, assignments, employees] = await Promise.all([
    listShifts(),
    listShiftAssignments(),
    listActiveEmployees(),
  ]);

  return (
    <ShiftsClient
      shifts={shifts}
      assignments={assignments}
      employees={employees}
      canWrite={canWrite(user.role, "hr")}
    />
  );
}
