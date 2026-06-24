"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>SEGMAX MOMS hit an unexpected error</h1>
          <p style={{ maxWidth: 380, fontSize: 14, color: "#666" }}>
            Something went badly wrong loading the application. Try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 8,
              padding: "8px 16px",
              borderRadius: 8,
              background: "#191359",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
