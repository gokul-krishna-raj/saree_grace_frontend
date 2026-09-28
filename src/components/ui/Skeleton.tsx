import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Hide from assistive tech — use inside a `SkeletonGroup` (or any other status region) so a
   *  grid of placeholders announces "Loading" once instead of once per tile. */
  decorative?: boolean;
}

export function Skeleton({ className, decorative = false, ...props }: SkeletonProps) {
  return (
    <div
      {...(decorative ? { "aria-hidden": true } : { role: "status", "aria-label": "Loading" })}
      className={cn("shimmer rounded-md", className)}
      {...props}
    />
  );
}

// One announced loading region wrapping any number of decorative placeholders.
export function SkeletonGroup({
  label = "Loading",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
