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

// Slide-in panel for mobile nav (Section 5), cart (Section 8), and filters (Section 6) — a
// bottom-sheet-on-mobile / drawer-on-desktop pattern shows up repeatedly in the checklist, so
// this is the one shared primitive for all of them rather than three bespoke implementations.
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
      <div className="bg-maroon-900/50 absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className={cn(
          "relative z-10 flex flex-col bg-white shadow-lg",
          side === "bottom" ? "max-h-[85vh] w-full rounded-t-xl" : "h-full w-full max-w-sm",
          side === "right" && "ml-auto",
          side === "left" && "mr-auto",
          className,
        )}
      >
        <div className="border-maroon-50 flex items-center justify-between border-b p-4">
          <h2 id="drawer-title" className="font-heading text-maroon-900 text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-maroon-700 hover:bg-maroon-50 focus-visible:outline-maroon-600 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
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
