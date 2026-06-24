import { notFound } from "next/navigation";

import { LabTestForm } from "@/app/(dashboard)/quality/sample-requests/[id]/lab-test-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { canWrite } from "@/lib/permissions";
import { getSampleRequest } from "@/lib/services/quality";
import { requireUser } from "@/lib/session";
import { formatDateTime, formatNumber } from "@/lib/utils";

type SpecSheetEntry = { parameter: string; unit: string; min: number | null; max: number | null };

export default async function SampleRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const sampleRequest = await getSampleRequest(user.role, id);
  if (!sampleRequest) notFound();

  const userCanWrite = canWrite(user.role, "quality");
  const specSheet = (sampleRequest.batch.product.specSheet as SpecSheetEntry[] | null) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sample Request — ${sampleRequest.batch.batchNumber}`}
        description={`${sampleRequest.batch.product.name} (${sampleRequest.batch.product.sku}) · requested by ${sampleRequest.requestedBy.name} on ${formatDateTime(sampleRequest.createdAt)}`}
        actions={
          <StatusBadge
            status={sampleRequest.labTest ? sampleRequest.labTest.result : sampleRequest.status}
            className="text-sm"
          />
        }
      />

      {sampleRequest.status === "PENDING" ? (
        userCanWrite ? (
          <LabTestForm sampleRequestId={sampleRequest.id} specSheet={specSheet} />
        ) : (
          <p className="text-sm text-muted-foreground">
            This sample is awaiting lab test entry. You do not have permission to run the test.
          </p>
        )
      ) : (
        sampleRequest.labTest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lab Test Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span>
                  Result: <StatusBadge status={sampleRequest.labTest.result} />
                </span>
                <span className="text-muted-foreground">
                  Tested by {sampleRequest.labTest.testedBy.name} on{" "}
                  {formatDateTime(sampleRequest.labTest.testedAt)}
                </span>
              </div>
              {sampleRequest.labTest.remarks && (
                <p className="text-sm">
                  <span className="font-medium">Remarks: </span>
                  {sampleRequest.labTest.remarks}
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Spec Min</TableHead>
                    <TableHead>Spec Max</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Pass?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRequest.labTest.parameters.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.parameterName} {p.unit && <span className="text-muted-foreground">({p.unit})</span>}
                      </TableCell>
                      <TableCell>{p.specMin != null ? formatNumber(p.specMin) : "—"}</TableCell>
                      <TableCell>{p.specMax != null ? formatNumber(p.specMax) : "—"}</TableCell>
                      <TableCell>{formatNumber(p.actualValue)}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.passed ? "PASS" : "FAIL"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
