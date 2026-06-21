"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
};

export function TextFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  type = "text",
  placeholder,
}: BaseProps<T> & { type?: string; placeholder?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ""}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function NumberFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  step = "any",
  placeholder,
}: BaseProps<T> & { step?: string; placeholder?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <Input
            id={name}
            type="number"
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ""}
            onChange={(e) =>
              field.onChange(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function TextareaFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  placeholder,
  rows = 3,
}: BaseProps<T> & { placeholder?: string; rows?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <Textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ""}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function SelectFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  options,
  placeholder = "Select…",
}: BaseProps<T> & { options: { label: string; value: string }[]; placeholder?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={name} className="w-full" aria-invalid={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function DateFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  disabled,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <Input
            id={name}
            type="date"
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            value={
              field.value
                ? new Date(field.value).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function CheckboxFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error} orientation="horizontal">
          <Checkbox
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <FieldLabel htmlFor={name} className="font-normal">
            {label}
          </FieldLabel>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}
