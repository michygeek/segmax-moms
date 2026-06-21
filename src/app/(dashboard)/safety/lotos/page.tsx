import { LotosTable } from "@/app/(dashboard)/safety/lotos/lotos-table";
import { canWrite } from "@/lib/permissions";
import { listLotos } from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function LotosPage() {
  const user = await requireUser();
  const lotos = await listLotos();

  return <LotosTable lotos={lotos} canWrite={canWrite(user.role, "safety")} />;
}
