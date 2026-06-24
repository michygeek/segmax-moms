import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pinned explicitly so server-rendered dates always show SEGMAX's local time
// (Africa/Lagos, UTC+1) regardless of the server/Vercel region's own timezone.
const SEGMAX_TIME_ZONE = "Africa/Lagos"

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: SEGMAX_TIME_ZONE,
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SEGMAX_TIME_ZONE,
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value)
}

/** e.g. generateCode("BATCH") -> "BATCH-20260621-4F2A" */
export function generateCode(prefix: string): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const randomPart = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `${prefix}-${datePart}-${randomPart}`
}
