import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNotificationsForUser } from "@/lib/services/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getNotificationsForUser(session.user.id);
  return NextResponse.json(data);
}
