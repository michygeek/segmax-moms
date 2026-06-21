"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextFormField } from "@/components/shared/form-fields";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(values, callbackUrl);
      if (result?.error) setServerError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <TextFormField
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="you@segmaxoil.com"
          required
        />
        <TextFormField
          control={control}
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
        />
        {serverError && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {serverError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </Button>
      </FieldGroup>
    </form>
  );
}
