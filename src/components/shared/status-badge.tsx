import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  neutral: "bg-muted text-muted-foreground",
} as const;

type Tone = keyof typeof TONE_CLASSES;

const STATUS_TONE: Record<string, Tone> = {
  // Production - BatchStatus
  DRAFT: "neutral",
  MATERIALS_VERIFIED: "info",
  IN_BLENDING: "warning",
  LAB_TEST_PENDING: "warning",
  ADJUSTMENT: "warning",
  FILTERING: "warning",
  FILLING: "warning",
  BADGING: "warning",
  PACKAGING: "warning",
  STORED: "info",
  COMPLETED: "success",
  ON_HOLD: "danger",
  REJECTED: "danger",
  // Inventory
  AVAILABLE: "success",
  QUARANTINED: "warning",
  CONSUMED: "neutral",
  EXPIRED: "danger",
  IN_STORAGE: "success",
  ALLOCATED: "warning",
  DISPATCHED: "info",
  // Quality
  PENDING: "warning",
  TESTED: "info",
  PASS: "success",
  FAIL: "danger",
  HOLD: "warning",
  OPEN: "warning",
  IN_PROGRESS: "info",
  CLOSED: "success",
  // HR
  PRESENT: "success",
  ABSENT: "danger",
  LATE: "warning",
  ON_LEAVE: "info",
  VERBAL_WARNING: "warning",
  WRITTEN_WARNING: "warning",
  SUSPENSION: "danger",
  TERMINATION: "danger",
  COMMENDATION: "success",
  // Sales
  BATCH_MATCHED: "info",
  PICKED_PACKED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  CONFIRMED: "success",
  RESOLVED: "success",
  // Safety
  OK: "success",
  ISSUES_FOUND: "danger",
  REQUESTED: "warning",
  APPROVED: "success",
  LOCKED: "danger",
  UNLOCKED: "success",
  REPORTED: "warning",
  INVESTIGATING: "info",
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

function formatLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <Badge
      variant="outline"
      className={cn(TONE_CLASSES[tone], "border-transparent font-medium", className)}
    >
      {formatLabel(status)}
    </Badge>
  );
}
