import type { Metadata } from "next";

import { LoginForm } from "@/app/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in — SEGMAX MOMS",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">SEGMAX OIL NIG LTD</h1>
          <p className="text-sm text-muted-foreground">
            Manufacturing Operations Management System
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your SEGMAX staff credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm callbackUrl={callbackUrl} />
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Internal system — contact your administrator for access.
        </p>
      </div>
    </div>
  );
}
