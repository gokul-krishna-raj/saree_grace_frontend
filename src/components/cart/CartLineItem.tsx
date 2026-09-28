"use client";

import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { CartLine } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatPrice";

export function CartLineItem({
  line,
  onUpdateQty,
  onRemove,
  href,
  onNavigate,
}: {
  line: CartLine;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
  /** Product page link, when known. */
  href?: string;
  onNavigate?: () => void;
}) {
  const image = (
    <span className="bg-muted relative block h-28 w-21 shrink-0 overflow-hidden rounded-sm">
      {line.image ? (
        <Image src={line.image} alt="" fill sizes="84px" className="object-cover" />
      ) : null}
    </span>
  );

  return (
    <div className="flex gap-4 py-5">
      {href ? (
        <Link href={href} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
          {image}
        </Link>
      ) : (
        image
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          {href ? (
            <Link
              href={href}
              onClick={onNavigate}
              className="text-foreground hover:text-primary line-clamp-2 text-sm leading-snug"
            >
              {line.name}
            </Link>
          ) : (
            <p className="text-foreground line-clamp-2 text-sm leading-snug">{line.name}</p>
          )}
          <p className="text-foreground shrink-0 text-sm font-medium tabular-nums">
            {formatPrice(line.price * line.qty)}
          </p>
        </div>
        {line.qty > 1 ? (
          <p className="text-muted-foreground mt-1 text-xs tabular-nums">
            {formatPrice(line.price)} each
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {/* 44px tap targets: quantity controls get tapped a lot. */}
          <div
            className="border-input flex h-11 items-center rounded-md border"
            role="group"
            aria-label={`Quantity of ${line.name}`}
          >
            <button
              type="button"
              onClick={() => onUpdateQty(Math.max(1, line.qty - 1))}
              disabled={line.qty <= 1}
              aria-label={`Decrease quantity of ${line.name}`}
              className="text-foreground hover:bg-muted flex h-full w-10 items-center justify-center rounded-l-md disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(line.qty + 1)}
              aria-label={`Increase quantity of ${line.name}`}
              className="text-foreground hover:bg-muted flex h-full w-10 items-center justify-center rounded-r-md"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${line.name} from cart`}
            className="text-muted-foreground hover:text-foreground min-h-11 px-1 text-xs underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
