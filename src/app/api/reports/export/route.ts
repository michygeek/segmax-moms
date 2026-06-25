import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { toCsv } from "@/lib/csv";
import { canRead } from "@/lib/permissions";
import { getReportRows, REPORT_COLUMNS, REPORT_TYPES, type ReportType } from "@/lib/services/reports";

const VALID_TYPES = new Set<string>(REPORT_TYPES.map((t) => t.value));

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canRead(session.user.role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }
  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "from and to dates are required" }, { status: 400 });
  }

  // Date-only inputs (YYYY-MM-DD) parse to midnight — widen to the full day
  // on both ends so the selected end date is actually included.
  const from = new Date(`${fromParam}T00:00:00.000`);
  const to = new Date(`${toParam}T23:59:59.999`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const reportType = type as ReportType;
  const rows = await getReportRows(reportType, { from, to });
  const csv = toCsv(rows as Record<string, unknown>[], REPORT_COLUMNS[reportType]);

  const filename = `segmax-${reportType}-report-${fromParam}-to-${toParam}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
