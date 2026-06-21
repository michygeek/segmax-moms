import { LocationsTable } from "@/app/(dashboard)/inventory/locations/locations-table";
import { canWrite } from "@/lib/permissions";
import { listStorageLocations } from "@/lib/services/inventory";
import { requireUser } from "@/lib/session";

export default async function LocationsPage() {
  const user = await requireUser();
  const locations = await listStorageLocations();

  return <LocationsTable locations={locations} canWrite={canWrite(user.role, "inventory")} />;
}
