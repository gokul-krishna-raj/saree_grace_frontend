"use client";

import { X } from "lucide-react";
import { type ReactNode, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useFocusTrap, useScrollLock } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
  /** Sticky area under the scrolling body (e.g. cart totals + checkout CTA). */
  footer?: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
  footer,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(panelRef, open, onClose);
  useScrollLock(open);

  if (!open) return null;

  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex", side === "bottom" && "items-end")}>
      <div
        className="animate-overlay-in bg-maroon-950/45 fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "bg-card text-card-foreground relative z-10 flex flex-col outline-none",
          side === "bottom"
            ? "animate-slide-in-up max-h-[88dvh] w-full rounded-t-xl"
            : "h-full w-[88vw] max-w-md",
          side === "right" && "animate-slide-in-right ml-auto",
          side === "left" && "animate-slide-in-left mr-auto",
          className,
        )}
        style={side === "bottom" ? { paddingBottom: "env(safe-area-inset-bottom)" } : undefined}
      >
        {side === "bottom" ? (
          <span
            className="bg-border mx-auto mt-2 block h-1 w-10 shrink-0 rounded-full"
            aria-hidden="true"
          />
        ) : null}
        <div className="border-border flex items-center justify-between border-b px-5 py-3">
          <h2 id={titleId} className="font-heading text-foreground text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer ? <div className="border-border border-t px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
