import { notFound } from "next/navigation";

import { StageActions } from "@/app/(dashboard)/sales/orders/[id]/stage-actions";
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
import {
  getAllowedNextStatuses,
  getOrder,
  getOrderAuditTrail,
  listAvailableFinishedGoods,
} from "@/lib/services/sales";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const order = await getOrder(id);
  if (!order) notFound();

  const userCanWrite = canWrite(user.role, "sales");
  const allowedNext = getAllowedNextStatuses(order.status);
  const auditTrail = await getOrderAuditTrail(order.id);

  const unmatchedProductIds = Array.from(
    new Set(order.items.filter((i) => !i.finishedGoodId).map((i) => i.productId))
  );
  const finishedGoodsByProduct: Record<string, { id: string; quantity: number; uom: string }[]> = {};
  if (allowedNext.includes("BATCH_MATCHED")) {
    await Promise.all(
      unmatchedProductIds.map(async (productId) => {
        finishedGoodsByProduct[productId] = await listAvailableFinishedGoods(productId);
      })
    );
  }

  const orderTotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.customer.name} — ${formatNumber(order.items.length)} item(s) — ${formatCurrency(orderTotal)}`}
        actions={<StatusBadge status={order.status} className="text-sm" />}
      />

      {userCanWrite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advance Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <StageActions
              orderId={order.id}
              allowedNext={allowedNext}
              items={order.items.map((i) => ({
                id: i.id,
                quantity: i.quantity,
                uom: i.product.uom,
                finishedGoodId: i.finishedGoodId,
                product: { id: i.productId, name: i.product.name, sku: i.product.sku },
              }))}
              finishedGoodsByProduct={finishedGoodsByProduct}
            />
            {allowedNext.length === 0 && (
              <p className="text-sm text-muted-foreground">This order has reached a final state.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">{order.customer.name}</p>
            {order.customer.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
          </div>
          <div>
            <p className="text-muted-foreground">Created By</p>
            <p className="font-medium">{order.createdBy.name}</p>
            <p className="text-muted-foreground">{formatDateTime(order.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Line Total</TableHead>
                <TableHead>Matched Batch / Finished Good</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.product.name} <span className="text-xs text-muted-foreground">({item.product.sku})</span>
                  </TableCell>
                  <TableCell>
                    {formatNumber(item.quantity)} {item.product.uom}
                  </TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                  <TableCell>
                    {item.batch ? (
                      <span>
                        {item.batch.batchNumber}
                        {item.finishedGood && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            ({formatNumber(item.finishedGood.quantity)} {item.finishedGood.uom},{" "}
                            <StatusBadge status={item.finishedGood.status} />)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not matched</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.deliveryNote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Note</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Delivery No.</p>
              <p className="font-medium">{order.deliveryNote.deliveryNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <StatusBadge status={order.deliveryNote.status} />
            </div>
            <div>
              <p className="text-muted-foreground">Vehicle / Driver</p>
              <p className="font-medium">
                {order.deliveryNote.vehicleNo ?? "—"} / {order.deliveryNote.driverName ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Dispatched / Confirmed</p>
              <p className="font-medium">
                {formatDateTime(order.deliveryNote.dispatchedAt)} / {formatDateTime(order.deliveryNote.confirmedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {auditTrail.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-4">
              {auditTrail.map((log) => (
                <li key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p>
                      <span className="font-medium">{log.action.replaceAll("_", " ")}</span>
                      {log.user && (
                        <>
                          {" "}
                          by <span className="font-medium">{log.user.name}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
