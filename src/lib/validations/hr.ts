import { z } from "zod";

// ── Employees ───────────────────────────────────────────────────────────

export const employeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
  fullName: z.string().min(1, "Full name is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  phone: z.string().optional(),
  hireDate: z.date({ message: "Hire date is required" }),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;

// ── Attendance ──────────────────────────────────────────────────────────

export const ATTENDANCE_STATUS_VALUES = ["PRESENT", "ABSENT", "LATE", "ON_LEAVE"] as const;

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  date: z.date({ message: "Date is required" }),
  clockIn: z.date().optional().nullable(),
  clockOut: z.date().optional().nullable(),
  status: z.enum(ATTENDANCE_STATUS_VALUES),
  handoverNotes: z.string().optional(),
});
export type AttendanceInput = z.infer<typeof attendanceSchema>;

// ── Shifts ──────────────────────────────────────────────────────────────

export const shiftSchema = z.object({
  name: z.string().min(1, "Shift name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});
export type ShiftInput = z.infer<typeof shiftSchema>;

export const shiftAssignmentSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  shiftId: z.string().min(1, "Select a shift"),
  date: z.date({ message: "Date is required" }),
});
export type ShiftAssignmentInput = z.infer<typeof shiftAssignmentSchema>;

// ── Training ────────────────────────────────────────────────────────────

export const trainingRecordSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  trainingName: z.string().min(1, "Training name is required"),
  completedDate: z.date({ message: "Completed date is required" }),
  expiryDate: z.date().optional().nullable(),
  certificateUrl: z.string().optional(),
});
export type TrainingRecordInput = z.infer<typeof trainingRecordSchema>;

// ── PPE Records (HR context) ───────────────────────────────────────────

export const ppeItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  compliant: z.boolean(),
});

export const ppeRecordSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  checkDate: z.date({ message: "Check date is required" }),
  items: z.array(ppeItemSchema).min(1, "Add at least one PPE item"),
  compliant: z.boolean(),
});
export type PpeRecordInput = z.infer<typeof ppeRecordSchema>;

// ── Discipline ──────────────────────────────────────────────────────────

export const DISCIPLINE_TYPE_VALUES = [
  "VERBAL_WARNING",
  "WRITTEN_WARNING",
  "SUSPENSION",
  "TERMINATION",
  "COMMENDATION",
] as const;

export const disciplineLogSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  type: z.enum(DISCIPLINE_TYPE_VALUES),
  description: z.string().min(1, "Description is required"),
  actionTaken: z.string().optional(),
  date: z.date({ message: "Date is required" }),
});
export type DisciplineLogInput = z.infer<typeof disciplineLogSchema>;
