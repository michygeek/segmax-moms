import { z } from "zod";

export const rawMaterialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  uom: z.string().min(1, "Unit of measure is required"),
  reorderLevel: z.number().min(0, "Reorder level cannot be negative"),
});
export type RawMaterialInput = z.infer<typeof rawMaterialSchema>;

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
});
export type SupplierInput = z.infer<typeof supplierSchema>;

export const LOCATION_TYPE_VALUES = ["RAW_MATERIAL", "FINISHED_GOODS"] as const;

export const storageLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(LOCATION_TYPE_VALUES),
  capacity: z.number().min(0, "Capacity cannot be negative").optional(),
});
export type StorageLocationInput = z.infer<typeof storageLocationSchema>;

export const receiveStockLotSchema = z.object({
  rawMaterialId: z.string().min(1, "Select a raw material"),
  supplierId: z.string().optional(),
  quantityReceived: z.number().positive("Quantity must be greater than 0"),
  uom: z.string().min(1, "Unit of measure is required"),
  receivedDate: z.date(),
  expiryDate: z.date().optional().nullable(),
  storageLocationId: z.string().optional(),
});
export type ReceiveStockLotInput = z.infer<typeof receiveStockLotSchema>;

export const STOCK_LOT_STATUS_VALUES = [
  "AVAILABLE",
  "QUARANTINED",
  "CONSUMED",
  "EXPIRED",
  "REJECTED",
] as const;

export const adjustStockLotSchema = z.object({
  status: z.enum(STOCK_LOT_STATUS_VALUES),
  reason: z.string().min(1, "A reason is required"),
});
export type AdjustStockLotInput = z.infer<typeof adjustStockLotSchema>;

export const transferFinishedGoodSchema = z.object({
  storageLocationId: z.string().min(1, "Select a storage location"),
});
export type TransferFinishedGoodInput = z.infer<typeof transferFinishedGoodSchema>;
