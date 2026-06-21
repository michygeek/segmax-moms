import { z } from "zod";

// ── Customers ────────────────────────────────────────────────────────────

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});
export type CustomerInput = z.infer<typeof customerSchema>;

// ── Sales Orders ─────────────────────────────────────────────────────────

export const orderLineSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  items: z.array(orderLineSchema).min(1, "Add at least one line item"),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "BATCH_MATCHED",
  "PICKED_PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const transitionOrderSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().optional(),
});
export type TransitionOrderInput = z.infer<typeof transitionOrderSchema>;

export const matchBatchSchema = z.object({
  matches: z
    .array(
      z.object({
        itemId: z.string().min(1),
        finishedGoodId: z.string().min(1, "Select a finished good"),
      })
    )
    .min(1),
});
export type MatchBatchInput = z.infer<typeof matchBatchSchema>;

export const dispatchOrderSchema = z.object({
  vehicleNo: z.string().min(1, "Vehicle number is required"),
  driverName: z.string().min(1, "Driver name is required"),
});
export type DispatchOrderInput = z.infer<typeof dispatchOrderSchema>;

// ── Complaints ───────────────────────────────────────────────────────────

export const complaintSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  orderId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  resolution: z.string().optional(),
});
export type ComplaintInput = z.infer<typeof complaintSchema>;

export const resolveComplaintSchema = z.object({
  resolution: z.string().min(1, "Resolution notes are required"),
});
export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;
