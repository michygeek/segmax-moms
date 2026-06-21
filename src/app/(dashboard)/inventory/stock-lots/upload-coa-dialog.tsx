"use client";

import { Loader2 } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { uploadStockLotCoaAction } from "@/app/(dashboard)/inventory/stock-lots/actions";
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

export function UploadCoaDialog({
  lotId,
  lotNumber,
  open,
  onOpenChange,
}: {
  lotId: string;
  lotNumber: string;
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
        await uploadStockLotCoaAction(lotId, formData);
        toast.success("Certificate of Analysis uploaded.");
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
          <DialogTitle>Upload COA — Lot {lotNumber}</DialogTitle>
          <DialogDescription>Attach the Certificate of Analysis document for this stock lot.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="coa-file">Document</FieldLabel>
            <Input id="coa-file" name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png" />
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
