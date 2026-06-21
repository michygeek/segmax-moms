"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProductAction, updateProductAction } from "@/app/(dashboard)/production/products/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { TextFormField } from "@/components/shared/form-fields";
import { productSchema, type ProductInput } from "@/lib/validations/production";

type Product = { id: string; name: string; sku: string; category: string | null; uom: string };

export function ProductFormDialog({
  product,
  trigger,
}: {
  product?: Product;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? "",
      uom: product?.uom ?? "L",
    },
  });

  function onSubmit(values: ProductInput) {
    startTransition(async () => {
      try {
        if (product) {
          await updateProductAction(product.id, values);
          toast.success("Product updated.");
        } else {
          await createProductAction(values);
          toast.success("Product created.");
          reset();
        }
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product details." : "Define a finished product SKU."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Product Name" required />
            <TextFormField control={control} name="sku" label="SKU" required />
            <TextFormField control={control} name="category" label="Category" placeholder="Engine Oil" />
            <TextFormField control={control} name="uom" label="Unit of Measure" required placeholder="L" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {product ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
