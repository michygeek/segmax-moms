"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createStorageLocationAction,
  updateStorageLocationAction,
} from "@/app/(dashboard)/inventory/locations/actions";
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
import { NumberFormField, SelectFormField, TextFormField } from "@/components/shared/form-fields";
import { storageLocationSchema, type StorageLocationInput } from "@/lib/validations/inventory";

type StorageLocation = { id: string; name: string; type: "RAW_MATERIAL" | "FINISHED_GOODS"; capacity: number | null };

const TYPE_OPTIONS = [
  { label: "Raw Material", value: "RAW_MATERIAL" },
  { label: "Finished Goods", value: "FINISHED_GOODS" },
];

export function LocationFormDialog({
  location,
  trigger,
}: {
  location?: StorageLocation;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<StorageLocationInput>({
    resolver: zodResolver(storageLocationSchema),
    defaultValues: {
      name: location?.name ?? "",
      type: location?.type ?? "RAW_MATERIAL",
      capacity: location?.capacity ?? undefined,
    },
  });

  function onSubmit(values: StorageLocationInput) {
    startTransition(async () => {
      try {
        if (location) {
          await updateStorageLocationAction(location.id, values);
          toast.success("Storage location updated.");
        } else {
          await createStorageLocationAction(values);
          toast.success("Storage location created.");
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
          <DialogTitle>{location ? "Edit Storage Location" : "New Storage Location"}</DialogTitle>
          <DialogDescription>
            {location ? "Update the storage location details." : "Define a warehouse or storage bay."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Name" required />
            <SelectFormField control={control} name="type" label="Type" options={TYPE_OPTIONS} required />
            <NumberFormField control={control} name="capacity" label="Capacity" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {location ? "Save Changes" : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
