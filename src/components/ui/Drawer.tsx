"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
}

export function Drawer({ open, onClose, title, children, side = "right", className }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex", side === "bottom" && "items-end")}>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className={cn(
          "bg-card text-card-foreground shadow-elegant relative z-10 flex flex-col transition-all",
          side === "bottom"
            ? "border-border max-h-[85vh] w-full rounded-t-2xl border-t"
            : "h-full w-full max-w-sm",
          side === "right" && "border-border ml-auto border-l",
          side === "left" && "border-border mr-auto border-r",
          className,
        )}
      >
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 id="drawer-title" className="font-heading text-foreground text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-ring flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
