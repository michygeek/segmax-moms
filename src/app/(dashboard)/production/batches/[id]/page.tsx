import { notFound } from "next/navigation";

import { ConsumeMaterialsForm } from "@/app/(dashboard)/production/batches/[id]/consume-materials-form";
import { StageActions } from "@/app/(dashboard)/production/batches/[id]/stage-actions";
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
import { getAllowedNextStatuses, getBatch } from "@/lib/services/production";
import { requireUser } from "@/lib/session";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const batch = await getBatch(user.role, id);
  if (!batch) notFound();

  const userCanWrite = canWrite(user.role, "production");
  const allowedNext = getAllowedNextStatuses(batch.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={batch.batchNumber}
        description={`${batch.product.name} (${batch.product.sku}) — ${formatNumber(batch.plannedQty)} ${batch.uom} planned`}
        actions={<StatusBadge status={batch.status} className="text-sm" />}
      />

      {userCanWrite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advance Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <StageActions batchId={batch.id} allowedNext={allowedNext} />
            {allowedNext.length === 0 && (
              <p className="text-sm text-muted-foreground">This batch has reached a final state.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Raw Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raw Material</TableHead>
                <TableHead>Qty Planned</TableHead>
                <TableHead>Qty Used</TableHead>
                <TableHead>Stock Lot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.rawMaterial.name}</TableCell>
                  <TableCell>
                    {formatNumber(m.qtyPlanned)} {m.uom}
                  </TableCell>
                  <TableCell>{m.qtyUsed !== null ? `${formatNumber(m.qtyUsed)} ${m.uom}` : "—"}</TableCell>
                  <TableCell>{m.stockLot?.lotNumber ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {userCanWrite && <ConsumeMaterialsForm batchId={batch.id} materials={batch.materials} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quality Control</CardTitle>
        </CardHeader>
        <CardContent>
          {batch.sampleRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sample requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {batch.sampleRequests.map((sr) => (
                <li key={sr.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <p className="font-medium">Sample request — {formatDateTime(sr.createdAt)}</p>
                    {sr.labTest && (
                      <p className="text-xs text-muted-foreground">
                        Tested {formatDateTime(sr.labTest.testedAt)} · {sr.labTest.parameters.length} parameter(s)
                      </p>
                    )}
                  </div>
                  <StatusBadge status={sr.labTest ? sr.labTest.result : sr.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {batch.finishedGoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Finished Goods</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {batch.finishedGoods.map((fg) => (
                <li key={fg.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>
                    {formatNumber(fg.quantity)} {fg.uom}
                  </span>
                  <StatusBadge status={fg.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {batch.logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p>
                    <StatusBadge status={log.stage} /> by{" "}
                    <span className="font-medium">{log.user.name}</span>
                  </p>
                  {log.note && <p className="text-muted-foreground">{log.note}</p>}
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
