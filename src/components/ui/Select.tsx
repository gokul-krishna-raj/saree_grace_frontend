import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes, useId } from "react";

import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-foreground text-sm font-medium">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "border-input bg-card text-foreground ring-offset-background h-11 w-full appearance-none rounded-lg border px-3.5 pr-10 text-base transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
