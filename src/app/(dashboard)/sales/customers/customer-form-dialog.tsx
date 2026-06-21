"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCustomerAction, updateCustomerAction } from "@/app/(dashboard)/sales/customers/actions";
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
import { customerSchema, type CustomerInput } from "@/lib/validations/sales";

type Customer = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export function CustomerFormDialog({
  customer,
  trigger,
}: {
  customer?: Customer;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      contactPerson: customer?.contactPerson ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
    },
  });

  function onSubmit(values: CustomerInput) {
    startTransition(async () => {
      try {
        if (customer) {
          await updateCustomerAction(customer.id, values);
          toast.success("Customer updated.");
        } else {
          await createCustomerAction(values);
          toast.success("Customer created.");
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
          <DialogTitle>{customer ? "Edit Customer" : "New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update the customer details." : "Register a new customer."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="name" label="Customer Name" required />
            <TextFormField control={control} name="contactPerson" label="Contact Person" />
            <TextFormField control={control} name="phone" label="Phone" />
            <TextFormField control={control} name="email" label="Email" type="email" />
            <TextFormField control={control} name="address" label="Address" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {customer ? "Save Changes" : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
