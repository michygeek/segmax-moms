"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { receiveStockLotAction } from "@/app/(dashboard)/inventory/stock-lots/actions";
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
import {
  DateFormField,
  NumberFormField,
  SelectFormField,
  TextFormField,
} from "@/components/shared/form-fields";
import { receiveStockLotSchema, type ReceiveStockLotInput } from "@/lib/validations/inventory";

type RawMaterial = { id: string; name: string; uom: string };
type Supplier = { id: string; name: string };
type StorageLocation = { id: string; name: string };

export function ReceiveStockDialog({
  rawMaterials,
  suppliers,
  storageLocations,
}: {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  storageLocations: StorageLocation[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset, watch } = useForm<ReceiveStockLotInput>({
    resolver: zodResolver(receiveStockLotSchema),
    defaultValues: {
      rawMaterialId: "",
      supplierId: "",
      quantityReceived: undefined as unknown as number,
      uom: "",
      receivedDate: new Date(),
      expiryDate: null,
      storageLocationId: "",
    },
  });

  const rawMaterialId = watch("rawMaterialId");

  function onSubmit(values: ReceiveStockLotInput) {
    startTransition(async () => {
      try {
        await receiveStockLotAction(values);
        toast.success("Stock lot received.");
        reset();
        setOpen(false);
      } catch {
        toast.error("Could not receive stock. Check the form and try again.");
      }
    });
  }

  const materialOptions = rawMaterials.map((m) => ({ label: m.name, value: m.id }));
  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.id }));
  const locationOptions = storageLocations.map((l) => ({ label: l.name, value: l.id }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" /> Receive Stock
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
          <DialogDescription>Record a new stock lot received from a supplier.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField
              control={control}
              name="rawMaterialId"
              label="Raw Material"
              options={materialOptions}
              required
            />
            <SelectFormField
              control={control}
              name="supplierId"
              label="Supplier"
              options={supplierOptions}
              placeholder="Optional"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberFormField control={control} name="quantityReceived" label="Quantity Received" required />
              <TextFormField
                control={control}
                name="uom"
                label="Unit of Measure"
                required
                placeholder={rawMaterials.find((m) => m.id === rawMaterialId)?.uom ?? "KG"}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateFormField control={control} name="receivedDate" label="Received Date" required />
              <DateFormField control={control} name="expiryDate" label="Expiry Date" />
            </div>
            <SelectFormField
              control={control}
              name="storageLocationId"
              label="Storage Location"
              options={locationOptions}
              placeholder="Optional"
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Receive Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
