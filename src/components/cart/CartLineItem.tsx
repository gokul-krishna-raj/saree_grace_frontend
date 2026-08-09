"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";

import type { CartLine } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatPrice";

export function CartLineItem({
  line,
  onUpdateQty,
  onRemove,
}: {
  line: CartLine;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-3 py-3">
      <div className="bg-maroon-50 relative h-20 w-16 shrink-0 overflow-hidden rounded-lg">
        {line.image ? (
          <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-maroon-900 line-clamp-2 text-sm font-medium">{line.name}</p>
        <p className="text-maroon-600 text-sm">{formatPrice(line.price)}</p>
        <div className="mt-1 flex items-center gap-2">
          {/* 44x44 minimum tap targets throughout (checklist Section 13) — these are quantity
              controls a shopper taps often, not a place to shave a few pixels for density. */}
          <div className="border-maroon-200 flex h-11 items-center rounded-lg border">
            <button
              type="button"
              onClick={() => onUpdateQty(Math.max(1, line.qty - 1))}
              aria-label={`Decrease quantity of ${line.name}`}
              className="text-maroon-700 flex h-11 w-11 items-center justify-center"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-sm" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(line.qty + 1)}
              aria-label={`Increase quantity of ${line.name}`}
              className="text-maroon-700 flex h-11 w-11 items-center justify-center"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${line.name} from cart`}
            className="text-maroon-500 ml-auto flex h-11 w-11 items-center justify-center hover:text-red-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="text-maroon-900 shrink-0 text-sm font-medium">
        {formatPrice(line.price * line.qty)}
      </p>
    </div>
  );
}
