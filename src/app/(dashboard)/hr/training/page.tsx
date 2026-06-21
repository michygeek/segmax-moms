import { TrainingTable } from "@/app/(dashboard)/hr/training/training-table";
import { canWrite } from "@/lib/permissions";
import { listActiveEmployees, listTrainingRecords } from "@/lib/services/hr";
import { requireUser } from "@/lib/session";

export default async function TrainingPage() {
  const user = await requireUser();
  const [records, employees] = await Promise.all([listTrainingRecords(), listActiveEmployees()]);

  return <TrainingTable records={records} employees={employees} canWrite={canWrite(user.role, "hr")} />;
}
