"use client";

import { Loader2 } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { uploadTrainingCertificateAction } from "@/app/(dashboard)/hr/training/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function UploadCertificateDialog({
  recordId,
  trainingName,
  open,
  onOpenChange,
}: {
  recordId: string;
  trainingName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await uploadTrainingCertificateAction(recordId, formData);
        toast.success("Certificate uploaded.");
        formRef.current?.reset();
        onOpenChange(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not upload file.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Certificate — {trainingName}</DialogTitle>
          <DialogDescription>Attach the training certificate document for this record.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="certificate-file">Document</FieldLabel>
            <Input id="certificate-file" name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png" />
          </Field>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
