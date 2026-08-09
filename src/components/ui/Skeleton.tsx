import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("bg-maroon-50 animate-pulse rounded-lg", className)}
      {...props}
    />
  );
}
