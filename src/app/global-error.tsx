"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

// Reports uncaught render errors to Sentry (no-op without a DSN) and shows a
// human, recoverable fallback (§5.6 #12). Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#0A0B14",
          color: "#EDEEF7",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#9AA0C0", marginTop: "0.75rem" }}>
            An unexpected error occurred. Please try again — our team has been notified.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#6D5EF6",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "0.7rem 1.4rem",
              fontWeight: 600,
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
