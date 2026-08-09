"use client";

import { useReportWebVitals } from "next/web-vitals";

import { env } from "@/lib/env";

// Section 19 — Core Web Vitals instrumentation. This wires up the *collection* of real user
// metrics (LCP, CLS, INP, etc.) and forwards them to GA4 exactly as Next's own docs recommend
// (node_modules/next/dist/docs/.../use-report-web-vitals.md) — it does NOT itself constitute
// "monitored post-launch," which is an ongoing process (dashboards, alert thresholds, review
// cadence) that only starts once this is actually deployed with real traffic; see NOTES.md.
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
    window.gtag?.("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
