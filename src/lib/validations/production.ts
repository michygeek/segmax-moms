import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),
  uom: z.string().min(1, "Unit of measure is required"),
});
export type ProductInput = z.infer<typeof productSchema>;

export const batchMaterialLineSchema = z.object({
  rawMaterialId: z.string().min(1, "Select a raw material"),
  qtyPlanned: z.number().positive("Quantity must be greater than 0"),
  uom: z.string().min(1),
});

export const createBatchSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  plannedQty: z.number().positive("Quantity must be greater than 0"),
  uom: z.string().min(1, "Unit of measure is required"),
  notes: z.string().optional(),
  materials: z.array(batchMaterialLineSchema).min(1, "Add at least one raw material"),
});
export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const BATCH_STATUS_VALUES = [
  "DRAFT",
  "MATERIALS_VERIFIED",
  "IN_BLENDING",
  "LAB_TEST_PENDING",
  "ADJUSTMENT",
  "FILTERING",
  "FILLING",
  "BADGING",
  "PACKAGING",
  "STORED",
  "COMPLETED",
  "ON_HOLD",
  "REJECTED",
] as const;

export const transitionBatchSchema = z.object({
  status: z.enum(BATCH_STATUS_VALUES),
  note: z.string().optional(),
});
export type TransitionBatchInput = z.infer<typeof transitionBatchSchema>;

export const consumeMaterialsSchema = z.object({
  consumptions: z
    .array(
      z.object({
        batchMaterialId: z.string().min(1),
        qtyUsed: z.number().positive("Enter the quantity used"),
      })
    )
    .min(1),
});
export type ConsumeMaterialsInput = z.infer<typeof consumeMaterialsSchema>;
