import { z } from "zod";

// ── Daily Safety Checklists ────────────────────────────────────────────────

export const checklistItemSchema = z.object({
  item: z.string().min(1, "Item description is required"),
  checked: z.boolean(),
  remarks: z.string().optional(),
});

export const createChecklistSchema = z.object({
  date: z.date(),
  shift: z.string().optional(),
  items: z.array(checklistItemSchema).min(1, "Add at least one checklist item"),
  status: z.string().min(1),
});
export type CreateChecklistInput = z.infer<typeof createChecklistSchema>;

// ── PPE Check-ins (context: SAFETY) ────────────────────────────────────────

export const ppeCheckItemSchema = z.object({
  item: z.string().min(1, "Item description is required"),
  compliant: z.boolean(),
});

export const createPpeCheckinSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  checkDate: z.date(),
  items: z.array(ppeCheckItemSchema).min(1, "Add at least one PPE item"),
  compliant: z.boolean(),
});
export type CreatePpeCheckinInput = z.infer<typeof createPpeCheckinSchema>;

// ── Hot Work Permits ───────────────────────────────────────────────────────

export const createPermitSchema = z.object({
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  validFrom: z.date(),
  validTo: z.date(),
});
export type CreatePermitInput = z.infer<typeof createPermitSchema>;

// ── Lock Out / Tag Out ─────────────────────────────────────────────────────

export const createLotoSchema = z.object({
  equipment: z.string().min(1, "Equipment is required"),
  reason: z.string().min(1, "Reason is required"),
});
export type CreateLotoInput = z.infer<typeof createLotoSchema>;

// ── Safety Incidents ───────────────────────────────────────────────────────

export const INCIDENT_TYPE_VALUES = ["SPILL", "INJURY", "NEAR_MISS", "FIRE", "OTHER"] as const;
export const INCIDENT_SEVERITY_VALUES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const createIncidentSchema = z.object({
  type: z.enum(INCIDENT_TYPE_VALUES),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  severity: z.enum(INCIDENT_SEVERITY_VALUES),
});
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

// ── Corrective Actions ─────────────────────────────────────────────────────

export const CORRECTIVE_ACTION_STATUS_VALUES = ["OPEN", "IN_PROGRESS", "COMPLETED"] as const;

export const createCorrectiveActionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  assignedToId: z.string().min(1, "Select an assignee"),
  dueDate: z.date().optional().nullable(),
  status: z.enum(CORRECTIVE_ACTION_STATUS_VALUES),
  linkType: z.enum(["NONE", "INCIDENT", "NCR"]),
  incidentId: z.string().optional(),
  ncrId: z.string().optional(),
});
export type CreateCorrectiveActionInput = z.infer<typeof createCorrectiveActionSchema>;

// ── Safety Drill Records ───────────────────────────────────────────────────

export const createDrillSchema = z.object({
  month: z.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z.number().int().min(2000, "Enter a valid year"),
  type: z.string().min(1, "Drill type is required"),
  attendees: z.number().int().min(0, "Attendees cannot be negative"),
  notes: z.string().optional(),
});
export type CreateDrillInput = z.infer<typeof createDrillSchema>;
