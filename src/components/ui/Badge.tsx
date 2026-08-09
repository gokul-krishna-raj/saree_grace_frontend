import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      maroon: "bg-maroon-50 text-maroon-700",
      // text-maroon-900, not text-gold-600 — measured 3.28:1 (needs 4.5:1) via a real
      // Lighthouse audit even with the darkest gold text shade; maroon-900 on gold-100 keeps
      // the gold accent while actually passing contrast (Section 14/16).
      gold: "bg-gold-100 text-maroon-900",
      outline: "border border-maroon-200 text-maroon-700",
      danger: "bg-red-50 text-red-600",
    },
  },
  defaultVariants: { variant: "maroon" },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
