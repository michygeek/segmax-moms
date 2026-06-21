import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { markNotificationRead } from "@/lib/services/notifications";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await markNotificationRead(id, session.user.id);
  return NextResponse.json({ ok: true });
}
