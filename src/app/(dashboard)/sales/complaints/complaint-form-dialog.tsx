"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createComplaintAction, updateComplaintAction } from "@/app/(dashboard)/sales/complaints/actions";
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
import { SelectFormField, TextareaFormField } from "@/components/shared/form-fields";
import { complaintSchema, type ComplaintInput } from "@/lib/validations/sales";

type Customer = { id: string; name: string };
type Order = { id: string; orderNumber: string };

type Complaint = {
  id: string;
  customerId: string;
  orderId: string | null;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  resolution: string | null;
};

const STATUS_OPTIONS = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export function ComplaintFormDialog({
  complaint,
  customers,
  orders,
  trigger,
}: {
  complaint?: Complaint;
  customers: Customer[];
  orders: Order[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<ComplaintInput>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      customerId: complaint?.customerId ?? "",
      orderId: complaint?.orderId ?? "",
      description: complaint?.description ?? "",
      status: complaint?.status ?? "OPEN",
      resolution: complaint?.resolution ?? "",
    },
  });

  const status = useWatch({ control, name: "status" });

  function onSubmit(values: ComplaintInput) {
    startTransition(async () => {
      try {
        if (complaint) {
          await updateComplaintAction(complaint.id, values);
          toast.success("Complaint updated.");
        } else {
          await createComplaintAction(values);
          toast.success("Complaint logged.");
          reset();
        }
        setOpen(false);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const customerOptions = customers.map((c) => ({ label: c.name, value: c.id }));
  const orderOptions = orders.map((o) => ({ label: o.orderNumber, value: o.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{complaint ? "Edit Complaint" : "New Complaint"}</DialogTitle>
          <DialogDescription>
            {complaint ? "Update the complaint details." : "Log a new customer complaint."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="customerId" label="Customer" options={customerOptions} required />
            <SelectFormField
              control={control}
              name="orderId"
              label="Related Order"
              options={orderOptions}
              placeholder="None"
            />
            <TextareaFormField control={control} name="description" label="Description" required rows={4} />
            <SelectFormField control={control} name="status" label="Status" options={STATUS_OPTIONS} required />
            {status === "RESOLVED" && (
              <TextareaFormField control={control} name="resolution" label="Resolution" required rows={3} />
            )}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {complaint ? "Save Changes" : "Log Complaint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
