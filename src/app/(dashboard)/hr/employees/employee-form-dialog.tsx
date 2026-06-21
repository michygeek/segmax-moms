"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createEmployeeAction, updateEmployeeAction } from "@/app/(dashboard)/hr/employees/actions";
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
import { DateFormField, TextFormField } from "@/components/shared/form-fields";
import { employeeSchema, type EmployeeInput } from "@/lib/validations/hr";

type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  phone: string | null;
  hireDate: Date;
};

export function EmployeeFormDialog({
  employee,
  trigger,
}: {
  employee?: Employee;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeCode: employee?.employeeCode ?? "",
      fullName: employee?.fullName ?? "",
      department: employee?.department ?? "",
      position: employee?.position ?? "",
      phone: employee?.phone ?? "",
      hireDate: employee?.hireDate ?? (undefined as unknown as Date),
    },
  });

  function onSubmit(values: EmployeeInput) {
    startTransition(async () => {
      try {
        if (employee) {
          await updateEmployeeAction(employee.id, values);
          toast.success("Employee updated.");
        } else {
          await createEmployeeAction(values);
          toast.success("Employee created.");
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
          <DialogTitle>{employee ? "Edit Employee" : "New Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update the employee details." : "Add a new employee record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextFormField control={control} name="employeeCode" label="Employee Code" required />
            <TextFormField control={control} name="fullName" label="Full Name" required />
            <TextFormField control={control} name="department" label="Department" required />
            <TextFormField control={control} name="position" label="Position" required />
            <TextFormField control={control} name="phone" label="Phone" />
            <DateFormField control={control} name="hireDate" label="Hire Date" required />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {employee ? "Save Changes" : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
