import { CorrectiveActionsTable } from "@/app/(dashboard)/safety/corrective-actions/corrective-actions-table";
import { canWrite } from "@/lib/permissions";
import {
  listAssignableUsers,
  listCorrectiveActions,
  listOpenIncidentsForLinking,
  listOpenNcrsForLinking,
} from "@/lib/services/safety";
import { requireUser } from "@/lib/session";

export default async function CorrectiveActionsPage() {
  const user = await requireUser();
  const [actions, users, incidents, ncrs] = await Promise.all([
    listCorrectiveActions(),
    listAssignableUsers(),
    listOpenIncidentsForLinking(),
    listOpenNcrsForLinking(),
  ]);

  return (
    <CorrectiveActionsTable
      actions={actions}
      users={users}
      incidents={incidents}
      ncrs={ncrs}
      canWrite={canWrite(user.role, "safety")}
    />
  );
}
