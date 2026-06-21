"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  confirmDelivery,
  createOrder,
  dispatchOrder,
  matchBatchToOrder,
  transitionOrder,
} from "@/lib/services/sales";
import { requireUser } from "@/lib/session";
import {
  createOrderSchema,
  dispatchOrderSchema,
  matchBatchSchema,
  type CreateOrderInput,
  type DispatchOrderInput,
  type MatchBatchInput,
} from "@/lib/validations/sales";

export async function createOrderAction(input: CreateOrderInput) {
  const user = await requireUser();
  const parsed = createOrderSchema.parse(input);
  const order = await createOrder(user, parsed);
  revalidatePath("/sales/orders");
  redirect(`/sales/orders/${order.id}`);
}

export async function transitionOrderAction(orderId: string, toStatus: OrderStatus, note?: string) {
  const user = await requireUser();
  await transitionOrder(user, orderId, toStatus, note);
  revalidatePath(`/sales/orders/${orderId}`);
  revalidatePath("/sales/orders");
}

export async function matchBatchToOrderAction(orderId: string, input: MatchBatchInput) {
  const user = await requireUser();
  const parsed = matchBatchSchema.parse(input);
  await matchBatchToOrder(user, orderId, parsed);
  revalidatePath(`/sales/orders/${orderId}`);
  revalidatePath("/sales/orders");
}

export async function dispatchOrderAction(orderId: string, input: DispatchOrderInput) {
  const user = await requireUser();
  const parsed = dispatchOrderSchema.parse(input);
  await dispatchOrder(user, orderId, parsed);
  revalidatePath(`/sales/orders/${orderId}`);
  revalidatePath("/sales/orders");
  revalidatePath("/sales/deliveries");
}

export async function confirmDeliveryAction(orderId: string) {
  const user = await requireUser();
  await confirmDelivery(user, orderId);
  revalidatePath(`/sales/orders/${orderId}`);
  revalidatePath("/sales/orders");
  revalidatePath("/sales/deliveries");
}
