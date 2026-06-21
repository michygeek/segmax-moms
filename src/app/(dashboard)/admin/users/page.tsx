import { UsersTable } from "@/app/(dashboard)/admin/users/users-table";
import { canWrite } from "@/lib/permissions";
import { listUsers } from "@/lib/services/admin";
import { requireUser } from "@/lib/session";

export default async function UsersPage() {
  const user = await requireUser();
  const users = await listUsers();

  return <UsersTable users={users} canWrite={canWrite(user.role, "admin")} />;
}
