import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-maroon-light shadow-md hover:shadow-lg",
        primary:
          "bg-primary text-primary-foreground hover:bg-maroon-light shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gradient-gold text-foreground font-semibold shadow-gold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        maroon:
          "bg-gradient-maroon text-primary-foreground font-semibold shadow-elegant hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        premium:
          "bg-gradient-premium text-primary-foreground font-semibold shadow-elegant hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        hero: "bg-primary text-primary-foreground font-semibold text-base px-8 py-6 shadow-elegant hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-gold/30",
        "hero-outline":
          "bg-transparent border-2 border-primary-foreground/80 text-primary-foreground font-semibold text-base px-8 py-6 hover:bg-primary-foreground/10 hover:border-primary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        md: "h-11 min-w-11 px-5 text-base",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
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
