"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { dispatchOrderAction } from "@/app/(dashboard)/sales/orders/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DispatchDialog({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!vehicleNo.trim() || !driverName.trim()) {
      toast.error("Enter both vehicle number and driver name.");
      return;
    }

    startTransition(async () => {
      try {
        await dispatchOrderAction(orderId, { vehicleNo, driverName });
        toast.success("Order dispatched.");
        setOpen(false);
        setVehicleNo("");
        setDriverName("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not dispatch order.");
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Dispatched
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Order</DialogTitle>
            <DialogDescription>Enter the vehicle and driver details for this delivery.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-no">Vehicle Number</Label>
              <Input id="vehicle-no" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driver-name">Driver Name</Label>
              <Input id="driver-name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isPending} onClick={handleSubmit}>
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
