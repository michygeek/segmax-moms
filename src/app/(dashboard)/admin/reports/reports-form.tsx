"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportType } from "@/lib/services/reports";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function ReportsForm({
  reportTypes,
}: {
  reportTypes: readonly { value: ReportType; label: string }[];
}) {
  const [type, setType] = useState<ReportType>(reportTypes[0].value);
  const [from, setFrom] = useState(isoDate(firstOfMonth()));
  const [to, setTo] = useState(isoDate(new Date()));

  const invalidRange = from > to;

  function handleDownload() {
    if (invalidRange) return;
    const params = new URLSearchParams({ type, from, to });
    window.location.href = `/api/reports/export?${params.toString()}`;
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="report-type">Report</FieldLabel>
        <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
          <SelectTrigger id="report-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="report-from">From</FieldLabel>
          <Input
            id="report-from"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="report-to">To</FieldLabel>
          <Input
            id="report-to"
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </div>

      {invalidRange && (
        <p className="text-sm text-destructive">The start date must be before the end date.</p>
      )}

      <Button onClick={handleDownload} disabled={invalidRange} className="w-fit">
        <Download className="size-4" />
        Download CSV
      </Button>
    </FieldGroup>
  );
}
