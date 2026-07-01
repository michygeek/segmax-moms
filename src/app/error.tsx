"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // ChunkLoadError means the browser tried to fetch a JS chunk that no longer
    // exists on the server (stale page after a new deployment). A hard reload
    // fetches fresh HTML with correct chunk hashes, fixing the issue automatically.
    if (error.name === "ChunkLoadError") {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred while loading this page. You can try again, or head back to
        the dashboard.
      </p>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" render={<a href="/dashboard" />}>
          Back to dashboard
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
