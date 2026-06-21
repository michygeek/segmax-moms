"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createRawMaterialAction,
  updateRawMaterialAction,
} from "@/app/(dashboard)/inventory/raw-materials/actions";
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
import { NumberFormField, TextFormField } from "@/components/shared/form-fields";
import { rawMaterialSchema, type RawMaterialInput } from "@/lib/validations/inventory";

type RawMaterial = { id: string; name: string; code: string; uom: string; reorderLevel: number };

export function RawMaterialFormDialog({
  rawMaterial,
  trigger,
}: {
  rawMaterial?: RawMaterial;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<RawMaterialInput>({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: {
      name: rawMaterial?.name ?? "",
      code: rawMaterial?.code ?? "",
      uom: rawMaterial?.uom ?? "KG",
      reorderLevel: rawMaterial?.reorderLevel ?? 0,
    },
  });

  function onSubmit(values: RawMaterialInput) {
    startTransition(async () => {
      try {
        if (rawMaterial) {
          await updateRawMaterialAction(rawMaterial.id, values);
          toast.success("Raw material updated.");
        } else {
          await createRawMaterialAction(values);
          toast.success("Raw material created.");
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
          <DialogTitle>{rawMaterial ? "Edit Raw Material" : "New Raw Material"}</DialogTitle>
          <DialogDescription>
            {rawMaterial ? "Update the raw material details." : "Define a raw material tracked in inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Name" required />
            <TextFormField control={control} name="code" label="Code" required />
            <TextFormField control={control} name="uom" label="Unit of Measure" required placeholder="KG" />
            <NumberFormField control={control} name="reorderLevel" label="Reorder Level" required />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {rawMaterial ? "Save Changes" : "Create Raw Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
