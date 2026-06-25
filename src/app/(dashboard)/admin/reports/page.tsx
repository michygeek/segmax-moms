import { ReportsForm } from "@/app/(dashboard)/admin/reports/reports-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { REPORT_TYPES } from "@/lib/services/reports";
import { requireUser } from "@/lib/session";

export default async function ReportsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Export company data as a CSV for a chosen date range."
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Generate a report</CardTitle>
          <CardDescription>Pick a report type and date range, then download.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsForm reportTypes={REPORT_TYPES} />
        </CardContent>
      </Card>
    </div>
  );
}
