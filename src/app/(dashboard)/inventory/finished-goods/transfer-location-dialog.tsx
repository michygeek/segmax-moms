"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { transferFinishedGoodAction } from "@/app/(dashboard)/inventory/finished-goods/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { SelectFormField } from "@/components/shared/form-fields";
import {
  transferFinishedGoodSchema,
  type TransferFinishedGoodInput,
} from "@/lib/validations/inventory";

type StorageLocation = { id: string; name: string };

export function TransferLocationDialog({
  finishedGoodId,
  storageLocations,
  open,
  onOpenChange,
}: {
  finishedGoodId: string;
  storageLocations: StorageLocation[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<TransferFinishedGoodInput>({
    resolver: zodResolver(transferFinishedGoodSchema),
    defaultValues: { storageLocationId: "" },
  });

  function onSubmit(values: TransferFinishedGoodInput) {
    startTransition(async () => {
      try {
        await transferFinishedGoodAction(finishedGoodId, values);
        toast.success("Finished good transferred.");
        reset();
        onOpenChange(false);
      } catch {
        toast.error("Could not transfer finished good.");
      }
    });
  }

  const options = storageLocations.map((l) => ({ label: l.name, value: l.id }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Location</DialogTitle>
          <DialogDescription>Move this finished good to a different storage location.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField
              control={control}
              name="storageLocationId"
              label="Storage Location"
              options={options}
              required
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
