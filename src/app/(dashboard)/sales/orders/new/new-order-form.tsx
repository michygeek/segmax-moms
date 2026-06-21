"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createOrderAction } from "@/app/(dashboard)/sales/orders/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { NumberFormField, SelectFormField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/sales";

type Customer = { id: string; name: string };
type Product = { id: string; name: string; sku: string; uom: string };

export function NewOrderForm({ customers, products }: { customers: Customer[]; products: Product[] }) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", quantity: undefined as unknown as number, unitPrice: undefined as unknown as number }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  function onSubmit(values: CreateOrderInput) {
    startTransition(async () => {
      try {
        await createOrderAction(values);
      } catch {
        toast.error("Could not create order. Check the form and try again.");
      }
    });
  }

  const customerOptions = customers.map((c) => ({ label: c.name, value: c.id }));
  const productOptions = products.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }));

  return (
    <div className="space-y-4">
      <PageHeader title="New Sales Order" description="Select the customer and add the order's line items." />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <SelectFormField control={control} name="customerId" label="Customer" options={customerOptions} required />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ productId: "", quantity: undefined as unknown as number, unitPrice: undefined as unknown as number })
              }
            >
              <Plus className="size-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_140px_140px_auto] sm:items-end">
                <SelectFormField
                  control={control}
                  name={`items.${index}.productId`}
                  label="Product"
                  options={productOptions}
                  required
                />
                <NumberFormField control={control} name={`items.${index}.quantity`} label="Quantity" required />
                <NumberFormField control={control} name={`items.${index}.unitPrice`} label="Unit Price" required />
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
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
}
