"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { submitLabTestAction } from "@/app/(dashboard)/quality/sample-requests/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  CheckboxFormField,
  SelectFormField,
  TextareaFormField,
} from "@/components/shared/form-fields";
import { submitLabTestSchema, type SubmitLabTestInput } from "@/lib/validations/quality";

type SpecSheetEntry = { parameter: string; unit: string; min: number | null; max: number | null };

const RESULT_OPTIONS = [
  { label: "Pass", value: "PASS" },
  { label: "Fail", value: "FAIL" },
  { label: "Hold", value: "HOLD" },
];

function computeOverallResult(
  parameters: { actualValue: number | string; specMin?: number | null; specMax?: number | null }[]
): "PASS" | "FAIL" {
  const anyFail = parameters.some((p) => {
    const value = typeof p.actualValue === "string" ? Number(p.actualValue) : p.actualValue;
    if (Number.isNaN(value)) return false;
    const passed =
      (p.specMin == null || value >= p.specMin) && (p.specMax == null || value <= p.specMax);
    return !passed;
  });
  return anyFail ? "FAIL" : "PASS";
}

export function LabTestForm({
  sampleRequestId,
  specSheet,
}: {
  sampleRequestId: string;
  specSheet: SpecSheetEntry[];
}) {
  const [isPending, startTransition] = useTransition();

  const defaultParameters = useMemo(
    () =>
      specSheet.length > 0
        ? specSheet.map((s) => ({
            parameterName: s.parameter,
            unit: s.unit,
            specMin: s.min,
            specMax: s.max,
            actualValue: undefined as unknown as number,
          }))
        : [
            {
              parameterName: "",
              unit: "",
              specMin: null,
              specMax: null,
              actualValue: undefined as unknown as number,
            },
          ],
    [specSheet]
  );

  const { control, handleSubmit, setValue } = useForm<SubmitLabTestInput>({
    resolver: zodResolver(submitLabTestSchema),
    defaultValues: {
      result: "PASS",
      remarks: "",
      raiseNcr: false,
      parameters: defaultParameters,
    },
  });

  const { fields } = useFieldArray({ control, name: "parameters" });
  const watchedParameters = useWatch({ control, name: "parameters" });
  const watchedResult = useWatch({ control, name: "result" });

  const suggestedResult = useMemo(
    () => computeOverallResult(watchedParameters ?? []),
    [watchedParameters]
  );

  function applySuggested() {
    setValue("result", suggestedResult);
  }

  function onSubmit(values: SubmitLabTestInput) {
    startTransition(async () => {
      try {
        await submitLabTestAction(sampleRequestId, values);
        toast.success(
          `Lab test recorded — batch moved to ${values.result === "PASS" ? "Filtering" : "Adjustment"}.`
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not submit lab test.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parameter Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_120px_120px_140px] sm:items-end">
              <Field>
                <FieldLabel>
                  {field.parameterName || `Parameter ${index + 1}`}
                  {field.unit ? ` (${field.unit})` : ""}
                </FieldLabel>
              </Field>
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Spec Min</FieldLabel>
                <Input value={field.specMin ?? "—"} disabled readOnly />
              </Field>
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Spec Max</FieldLabel>
                <Input value={field.specMax ?? "—"} disabled readOnly />
              </Field>
              <Field>
                <FieldLabel htmlFor={`parameters.${index}.actualValue`} className="text-xs">
                  Actual Value
                </FieldLabel>
                <Input
                  id={`parameters.${index}.actualValue`}
                  type="number"
                  step="any"
                  value={watchedParameters?.[index]?.actualValue ?? ""}
                  onChange={(e) =>
                    setValue(
                      `parameters.${index}.actualValue`,
                      e.target.value === "" ? (undefined as unknown as number) : Number(e.target.value)
                    )
                  }
                />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px]">
                <SelectFormField
                  control={control}
                  name="result"
                  label="Overall Result"
                  options={RESULT_OPTIONS}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applySuggested}
                disabled={watchedResult === suggestedResult}
              >
                Use suggested: {suggestedResult}
              </Button>
            </div>
            <TextareaFormField
              control={control}
              name="remarks"
              label="Remarks"
              placeholder="Observations, deviations, corrective notes…"
            />
            {watchedResult === "FAIL" && (
              <CheckboxFormField
                control={control}
                name="raiseNcr"
                label="Raise a Non-Conformance Report for this failure"
                description="Notifies QC Officers and the Production Manager."
              />
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Submit Lab Test &amp; Release Batch
        </Button>
      </div>
    </form>
  );
}
