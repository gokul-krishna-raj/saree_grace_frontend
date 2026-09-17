import { forwardRef, type InputHTMLAttributes, useId } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-foreground text-sm font-medium">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "border-input bg-card text-foreground placeholder:text-muted-foreground ring-offset-background flex h-11 w-full rounded-lg border px-3.5 text-base transition-colors",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-muted-foreground text-sm">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
