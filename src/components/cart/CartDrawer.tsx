"use client";

import Link from "next/link";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";

export function CartDrawer() {
  const open = useAppSelector((state) => state.ui.cartDrawerOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(setCartDrawerOpen(false));
  const {
    lines,
    itemsTotal,
    shippingFee,
    total,
    isEmpty,
    isLoading,
    isError,
    isFetching,
    refetch,
    updateQty,
    removeItem,
  } = useCart();

  return (
    <Drawer open={open} onClose={close} title="Your cart">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-maroon-700">Couldn&apos;t load your cart.</p>
          <Button variant="secondary" onClick={refetch} isLoading={isFetching}>
            Try again
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-maroon-700">Your cart is empty</p>
          <Link
            href="/products"
            onClick={close}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="divide-maroon-50 flex flex-col divide-y">
          {lines.map((line) => (
            <CartLineItem
              key={line.id}
              line={line}
              onUpdateQty={(qty) => updateQty(line, qty)}
              onRemove={() => removeItem(line)}
            />
          ))}
        </div>
      )}
      {!isEmpty && !isError ? (
        <div className="mt-4 flex flex-col gap-3">
          <CartSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total} />
          <Link href="/cart" onClick={close} className={cn(buttonVariants({ variant: "ghost" }))}>
            View full cart
          </Link>
          <Link
            href="/checkout"
            onClick={close}
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            Checkout
          </Link>
        </div>
      ) : null}
    </Drawer>
  );
}
