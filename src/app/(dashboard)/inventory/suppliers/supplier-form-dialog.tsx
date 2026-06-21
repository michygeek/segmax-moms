"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createSupplierAction,
  updateSupplierAction,
} from "@/app/(dashboard)/inventory/suppliers/actions";
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
import { TextareaFormField, TextFormField } from "@/components/shared/form-fields";
import { supplierSchema, type SupplierInput } from "@/lib/validations/inventory";

type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export function SupplierFormDialog({
  supplier,
  trigger,
}: {
  supplier?: Supplier;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      contactName: supplier?.contactName ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      address: supplier?.address ?? "",
    },
  });

  function onSubmit(values: SupplierInput) {
    startTransition(async () => {
      try {
        if (supplier) {
          await updateSupplierAction(supplier.id, values);
          toast.success("Supplier updated.");
        } else {
          await createSupplierAction(values);
          toast.success("Supplier created.");
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
          <DialogTitle>{supplier ? "Edit Supplier" : "New Supplier"}</DialogTitle>
          <DialogDescription>
            {supplier ? "Update the supplier details." : "Add a supplier of raw materials."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Name" required />
            <TextFormField control={control} name="contactName" label="Contact Name" />
            <TextFormField control={control} name="phone" label="Phone" />
            <TextFormField control={control} name="email" label="Email" type="email" />
            <TextareaFormField control={control} name="address" label="Address" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {supplier ? "Save Changes" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
