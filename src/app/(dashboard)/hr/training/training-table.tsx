"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteTrainingRecordAction } from "@/app/(dashboard)/hr/training/actions";
import { TrainingFormDialog } from "@/app/(dashboard)/hr/training/training-form-dialog";
import { UploadCertificateDialog } from "@/app/(dashboard)/hr/training/upload-certificate-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { cn, formatDate } from "@/lib/utils";

type Employee = { id: string; fullName: string; employeeCode: string };

type TrainingRecordRow = {
  id: string;
  employeeId: string;
  trainingName: string;
  completedDate: Date;
  expiryDate: Date | null;
  certificateUrl: string | null;
  employee: { fullName: string; employeeCode: string };
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function expiryTone(expiryDate: Date | null): "expired" | "expiring" | "ok" {
  if (!expiryDate) return "ok";
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff < 0) return "expired";
  if (diff <= THIRTY_DAYS_MS) return "expiring";
  return "ok";
}

export function TrainingTable({
  records,
  employees,
  canWrite,
}: {
  records: TrainingRecordRow[];
  employees: Employee[];
  canWrite: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<TrainingRecordRow | null>(null);
  const [uploadTarget, setUploadTarget] = useState<TrainingRecordRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<TrainingRecordRow>[] = [
    {
      id: "employee",
      header: "Employee",
      accessorFn: (row) => row.employee.fullName,
      cell: ({ row }) => (
        <div>
          <p>{row.original.employee.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.original.employee.employeeCode}</p>
        </div>
      ),
    },
    { accessorKey: "trainingName", header: "Training" },
    { accessorKey: "completedDate", header: "Completed", cell: ({ row }) => formatDate(row.original.completedDate) },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const tone = expiryTone(row.original.expiryDate);
        return (
          <span
            className={cn(
              tone === "expired" && "font-medium text-red-600 dark:text-red-400",
              tone === "expiring" && "font-medium text-amber-600 dark:text-amber-400"
            )}
          >
            {formatDate(row.original.expiryDate)}
            {tone === "expired" && " (Expired)"}
            {tone === "expiring" && " (Expiring soon)"}
          </span>
        );
      },
    },
    {
      accessorKey: "certificateUrl",
      header: "Certificate",
      cell: ({ row }) =>
        row.original.certificateUrl ? (
          <a
            href={row.original.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            View
          </a>
        ) : (
          "—"
        ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: TrainingRecordRow } }) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setUploadTarget(row.original)}>
                  <Upload className="size-4" />
                </Button>
                <TrainingFormDialog
                  record={row.original}
                  employees={employees}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row.original)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteTrainingRecordAction(deleteTarget.id);
        toast.success("Training record deleted.");
      } catch {
        toast.error("Could not delete training record.");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Training Records"
        description="Track completed training, certifications, and expiry dates."
        actions={
          canWrite ? (
            <TrainingFormDialog
              employees={employees}
              trigger={
                <Button>
                  <Plus className="size-4" /> New Training Record
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="Search training records…"
        emptyMessage="No training records yet."
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this training record?"
        description={`The record for "${deleteTarget?.trainingName}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={handleDelete}
      />
      {uploadTarget && (
        <UploadCertificateDialog
          recordId={uploadTarget.id}
          trainingName={uploadTarget.trainingName}
          open={!!uploadTarget}
          onOpenChange={(open) => !open && setUploadTarget(null)}
        />
      )}
    </div>
  );
}
