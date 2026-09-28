import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide ring-offset-background transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-maroon-800",
        primary: "bg-primary text-primary-foreground hover:bg-maroon-800",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-foreground/25 bg-transparent text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground hover:bg-cream-dark",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary active:scale-100",
        // Kept for API compatibility — restyled from the old gradient to a quiet solid.
        gold: "bg-gold-100 text-maroon-900 hover:bg-gold-200",
        maroon: "bg-primary text-primary-foreground hover:bg-maroon-800",
        premium: "bg-maroon-900 text-primary-foreground hover:bg-maroon-950",
        hero: "bg-primary text-primary-foreground hover:bg-maroon-800 text-base px-8",
        "hero-outline":
          "border border-primary-foreground/70 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-8",
        light: "bg-background text-foreground hover:bg-cream",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        md: "h-11 min-w-11 px-5",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          aria-busy={isLoading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
