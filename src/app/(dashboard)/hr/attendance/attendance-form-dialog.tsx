"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createAttendanceAction } from "@/app/(dashboard)/hr/attendance/actions";
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
  SelectFormField,
  TextareaFormField,
  TextFormField,
} from "@/components/shared/form-fields";
import { ATTENDANCE_STATUS_VALUES } from "@/lib/validations/hr";

type Employee = { id: string; fullName: string; employeeCode: string };

const STATUS_OPTIONS = ATTENDANCE_STATUS_VALUES.map((s) => ({
  label: s.replaceAll("_", " "),
  value: s,
}));

// Local form schema: clockIn/clockOut are plain datetime-local strings in the UI,
// converted to Date instances when submitting to the server action.
const attendanceFormSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  date: z.date({ message: "Date is required" }),
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  status: z.enum(ATTENDANCE_STATUS_VALUES),
  handoverNotes: z.string().optional(),
});
type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

export function AttendanceFormDialog({
  employees,
  trigger,
}: {
  employees: Employee[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: "",
      date: undefined as unknown as Date,
      clockIn: "",
      clockOut: "",
      status: "PRESENT",
      handoverNotes: "",
    },
  });

  function onSubmit(values: AttendanceFormValues) {
    startTransition(async () => {
      try {
        await createAttendanceAction({
          employeeId: values.employeeId,
          date: values.date,
          clockIn: values.clockIn ? new Date(values.clockIn) : null,
          clockOut: values.clockOut ? new Date(values.clockOut) : null,
          status: values.status,
          handoverNotes: values.handoverNotes,
        });
        toast.success("Attendance recorded.");
        reset();
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  const employeeOptions = employees.map((e) => ({ label: `${e.fullName} (${e.employeeCode})`, value: e.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>Log a daily attendance entry for an employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <SelectFormField control={control} name="employeeId" label="Employee" options={employeeOptions} required />
            <DateFormField control={control} name="date" label="Date" required />
            <TextFormField control={control} name="clockIn" type="datetime-local" label="Clock In" />
            <TextFormField control={control} name="clockOut" type="datetime-local" label="Clock Out" />
            <SelectFormField control={control} name="status" label="Status" options={[...STATUS_OPTIONS]} required />
            <TextareaFormField control={control} name="handoverNotes" label="Handover Notes" />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
