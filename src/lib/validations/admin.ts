import { z } from "zod";

export const ROLE_VALUES = [
  "CEO",
  "SUPER_ADMIN",
  "PRODUCTION_MANAGER",
  "STORE_MANAGER",
  "QC_OFFICER",
  "HR_OFFICER",
  "SALES_OFFICER",
  "SAFETY_OFFICER",
] as const;

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLE_VALUES),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(ROLE_VALUES),
  isActive: z.boolean(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
