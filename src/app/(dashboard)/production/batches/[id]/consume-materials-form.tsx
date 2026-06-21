"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { consumeMaterialsAction } from "@/app/(dashboard)/production/batches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MaterialLine = {
  id: string;
  qtyPlanned: number;
  qtyUsed: number | null;
  uom: string;
  rawMaterial: { name: string };
};

export function ConsumeMaterialsForm({ batchId, materials }: { batchId: string; materials: MaterialLine[] }) {
  const pendingMaterials = materials.filter((m) => m.qtyUsed === null);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(pendingMaterials.map((m) => [m.id, String(m.qtyPlanned)]))
  );
  const [isPending, startTransition] = useTransition();

  if (pendingMaterials.length === 0) return null;

  function handleSubmit() {
    const consumptions = pendingMaterials
      .map((m) => ({ batchMaterialId: m.id, qtyUsed: Number(values[m.id]) }))
      .filter((c) => c.qtyUsed > 0);

    if (consumptions.length === 0) {
      toast.error("Enter at least one quantity used.");
      return;
    }

    startTransition(async () => {
      try {
        await consumeMaterialsAction(batchId, { consumptions });
        toast.success("Material consumption recorded — stock deducted (FIFO).");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not record consumption.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <p className="text-sm font-medium">Record actual material consumption</p>
      <p className="text-xs text-muted-foreground">
        Deducts from the oldest available stock lot (FIFO) for each raw material.
      </p>
      <div className="space-y-2">
        {pendingMaterials.map((m) => (
          <div key={m.id} className="grid grid-cols-[1fr_140px] items-center gap-3">
            <Label htmlFor={`use-${m.id}`}>{m.rawMaterial.name}</Label>
            <div className="flex items-center gap-1">
              <Input
                id={`use-${m.id}`}
                type="number"
                step="any"
                value={values[m.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [m.id]: e.target.value }))}
              />
              <span className="text-sm text-muted-foreground">{m.uom}</span>
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSubmit} disabled={isPending}>
        Record Consumption
      </Button>
    </div>
  );
}
