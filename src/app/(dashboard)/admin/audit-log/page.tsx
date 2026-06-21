import { AuditLogTable } from "@/app/(dashboard)/admin/audit-log/audit-log-table";
import { listAuditLog } from "@/lib/services/admin";
import { requireUser } from "@/lib/session";

export default async function AuditLogPage() {
  await requireUser();
  const entries = await listAuditLog();

  return <AuditLogTable entries={entries} />;
}
