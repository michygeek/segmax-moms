import { z } from "zod";

// ── Lab Test Entry ─────────────────────────────────────────────────────────

export const testParameterInputSchema = z.object({
  parameterName: z.string().min(1),
  unit: z.string().optional(),
  specMin: z.number().nullable().optional(),
  specMax: z.number().nullable().optional(),
  actualValue: z.number({ message: "Enter the measured value" }),
});
export type TestParameterInput = z.infer<typeof testParameterInputSchema>;

export const LAB_TEST_RESULT_VALUES = ["PASS", "FAIL", "HOLD"] as const;

export const submitLabTestSchema = z.object({
  result: z.enum(LAB_TEST_RESULT_VALUES),
  remarks: z.string().optional(),
  parameters: z.array(testParameterInputSchema).min(1, "Add at least one parameter result"),
  raiseNcr: z.boolean().optional(),
});
export type SubmitLabTestInput = z.infer<typeof submitLabTestSchema>;

// ── Sample Requests (ad-hoc) ────────────────────────────────────────────────

export const createSampleRequestSchema = z.object({
  batchId: z.string().min(1, "Select a batch"),
  notes: z.string().optional(),
});
export type CreateSampleRequestInput = z.infer<typeof createSampleRequestSchema>;

// ── Non-Conformance Reports ─────────────────────────────────────────────────

export const ncrSchema = z.object({
  batchId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
});
export type NcrInput = z.infer<typeof ncrSchema>;

export const NCR_STATUS_VALUES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

// ── Retention Samples ────────────────────────────────────────────────────────

export const retentionSampleSchema = z.object({
  batchId: z.string().min(1, "Select a batch"),
  location: z.string().min(1, "Location is required"),
  retainedUntil: z.date({ message: "Retained-until date is required" }),
  disposed: z.boolean().optional(),
});
export type RetentionSampleInput = z.infer<typeof retentionSampleSchema>;
