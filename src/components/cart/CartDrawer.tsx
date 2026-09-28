"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
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
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const showFooter = !isEmpty && !isError && !isLoading;

  return (
    <Drawer
      open={open}
      onClose={close}
      title={itemCount > 0 ? `Your cart (${itemCount})` : "Your cart"}
      footer={
        showFooter ? (
          <div className="flex flex-col gap-4">
            <CartSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total} />
            <Link
              href="/checkout"
              onClick={close}
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className="text-foreground text-center text-sm underline underline-offset-4"
            >
              View cart
            </Link>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 py-2" aria-hidden="true">
          {[0, 1].map((key) => (
            <div key={key} className="flex gap-4">
              <div className="shimmer h-28 w-21 rounded-sm" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <div className="shimmer h-3.5 w-4/5 rounded" />
                <div className="shimmer h-3.5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-foreground">Couldn&apos;t load your cart.</p>
          <Button variant="outline" onClick={refetch} isLoading={isFetching}>
            Try again
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <ShoppingBag
              className="text-muted-foreground h-7 w-7"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="font-display text-foreground text-xl">Your cart is empty</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Discover handwoven sarees from Elampillai.
            </p>
          </div>
          <Link href="/products" onClick={close} className={cn(buttonVariants(), "mt-2")}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="divide-border -mt-4 flex flex-col divide-y">
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
    </Drawer>
  );
}
