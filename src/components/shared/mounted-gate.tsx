"use client";

import { useEffect, useState } from "react";

/**
 * Defers rendering `children` until after the first client-side mount.
 *
 * Recharts' `ResponsiveContainer` measures its container via the DOM, which
 * doesn't exist during server-side rendering — Next.js still SSRs "use
 * client" components for the initial HTML, so without this gate charts try
 * to measure a nonexistent layout server-side and can throw. Rendering
 * `fallback` (identical on server and first client paint) instead avoids
 * that entirely, and avoids a hydration mismatch.
 */
export function MountedGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
