import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-maroon-50 rounded-lg border bg-white p-4 shadow-sm", className)}
      {...props}
    />
  );
}
