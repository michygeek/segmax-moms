"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createBatchAction } from "@/app/(dashboard)/production/batches/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  NumberFormField,
  SelectFormField,
  TextFormField,
  TextareaFormField,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { createBatchSchema, type CreateBatchInput } from "@/lib/validations/production";

type Product = { id: string; name: string; sku: string; uom: string };
type RawMaterial = { id: string; name: string; uom: string };

export function NewBatchForm({ products, rawMaterials }: { products: Product[]; rawMaterials: RawMaterial[] }) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<CreateBatchInput>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      productId: "",
      plannedQty: undefined as unknown as number,
      uom: "L",
      notes: "",
      materials: [{ rawMaterialId: "", qtyPlanned: undefined as unknown as number, uom: "L" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "materials" });

  function onSubmit(values: CreateBatchInput) {
    startTransition(async () => {
      try {
        await createBatchAction(values);
      } catch {
        toast.error("Could not create batch. Check the form and try again.");
      }
    });
  }

  const productOptions = products.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }));
  const materialOptions = rawMaterials.map((m) => ({ label: m.name, value: m.id }));

  return (
    <div className="space-y-4">
      <PageHeader title="New Batch Card" description="Select the product and confirm raw material requirements." />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectFormField
                  control={control}
                  name="productId"
                  label="Product"
                  options={productOptions}
                  required
                />
                <NumberFormField control={control} name="plannedQty" label="Planned Quantity" required />
                <TextFormField control={control} name="uom" label="Unit of Measure" required />
              </div>
              <TextareaFormField control={control} name="notes" label="Notes" placeholder="Optional batch notes" />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Raw Materials</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ rawMaterialId: "", qtyPlanned: undefined as unknown as number, uom: "L" })}
            >
              <Plus className="size-4" /> Add Material
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_140px_100px_auto] sm:items-end">
                <SelectFormField
                  control={control}
                  name={`materials.${index}.rawMaterialId`}
                  label="Raw Material"
                  options={materialOptions}
                  required
                />
                <NumberFormField
                  control={control}
                  name={`materials.${index}.qtyPlanned`}
                  label="Qty Planned"
                  required
                />
                <TextFormField control={control} name={`materials.${index}.uom`} label="UoM" required />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Create Batch Card
          </Button>
        </div>
      </form>
    </div>
  );
}
