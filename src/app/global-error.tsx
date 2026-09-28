"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/reportError";

// Only reached if the ROOT LAYOUT ITSELF throws (StoreProvider, AuthBootstrap, etc.) — replaces
// the entire document, so it must define its own <html>/<body> and cannot rely on globals.css
// (Next.js does not load it here) or Tailwind classes. Colors are inlined from the same
// --color-maroon-*/--color-gold-* values in globals.css so this still reads as Saree Grace, not
// a generic browser error page, even in the one place the app's normal styling can't reach.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#faf6f0",
          color: "#3a1218",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "24rem", fontSize: "0.875rem", color: "#7a2635", margin: 0 }}>
          Saree Grace hit a snag loading this page. Please try again.
        </p>
        <button
          type="button"
          onClick={retry}
          style={{
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#7a2635",
            color: "#faf6f0",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
