"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function loginAction(
  values: { email: string; password: string },
  callbackUrl?: string
): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    // "/" itself immediately redirects to "/dashboard" (see app/page.tsx) —
    // sending signIn() there directly avoids stacking a second redirect on
    // top of the action-redirect the client just followed, which is what
    // was producing "An unexpected response was received from the server."
    // on a fresh first visit (root "/" -> /login?callbackUrl=%2F -> back to "/").
    const target = callbackUrl && callbackUrl.startsWith("/") && callbackUrl !== "/" ? callbackUrl : "/dashboard";
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: target,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
