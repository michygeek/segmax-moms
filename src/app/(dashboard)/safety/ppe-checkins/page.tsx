import { PpeCheckinsTable } from "@/app/(dashboard)/safety/ppe-checkins/ppe-checkins-table";
import { canWrite } from "@/lib/permissions";
import { listActiveEmployees, listPpeCheckins } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function PpeCheckinsPage() {
  const user = await requireUser();
  const [checkins, employees] = await Promise.all([listPpeCheckins(), listActiveEmployees()]);

  return (
    <PpeCheckinsTable
      checkins={checkins}
      employees={employees}
      canWrite={canWrite(user.role, "safety")}
    />
  );
}
