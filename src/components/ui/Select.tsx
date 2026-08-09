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
          <label htmlFor={selectId} className="text-maroon-900 text-sm font-medium">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "border-maroon-100 text-maroon-900 h-11 w-full appearance-none rounded-lg border bg-white px-3.5 pr-10 text-base",
              "focus-visible:outline-maroon-600 focus-visible:outline-2 focus-visible:outline-offset-2",
              error && "border-red-500 focus-visible:outline-red-500",
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="text-maroon-600 pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
