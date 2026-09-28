import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

// The one section header used across the storefront, so every section shares the same rhythm:
// eyebrow → serif title → short supporting line, with an optional "view all" link aligned right.
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 lg:mb-12",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <Heading id={id} className="text-heading-xl text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group text-foreground inline-flex shrink-0 items-center gap-2 text-sm font-medium"
        >
          <span className="link-underline">{action.label}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
