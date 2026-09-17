"use client";

import { X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { createPortal } from "react-dom";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "border-border bg-card shadow-elegant animate-scale-in relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border p-6 transition-all",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-heading text-foreground text-xl font-semibold">
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
        {children}
      </div>
    </div>,
    document.body,
  );
}
