"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";

export default function CartPage() {
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
  // Read status directly rather than deriving from `isAuthenticated` alone — "checking" (silent
  // refresh in flight, see AddToCartControls.tsx) must NOT be treated the same as a confirmed
  // "unauthenticated", or a genuinely logged-in user who clicks through fast enough gets bounced
  // to /login instead of /checkout, which would have correctly waited out the "checking" window.
  const authStatus = useAppSelector((state) => state.auth.status);
  const router = useRouter();

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col">
        <ErrorState
          title="Couldn't load your cart"
          message="Check your connection and try again."
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Your cart is empty</h1>
        <p className="text-maroon-600 text-sm">
          Explore our handloom collection and add something you love.
        </p>
        <Link href="/products" className={cn(buttonVariants({ variant: "primary" }))}>
          Shop sarees
        </Link>
      </main>
    );
  }

  function handleCheckout() {
    // Only a confirmed "unauthenticated" sends the user to login — "checking" and
    // "authenticated" both go to /checkout, where ProtectedRoute is the single source of truth
    // for waiting out "checking" and redirecting only once it actually resolves to logged-out.
    router.push(authStatus === "unauthenticated" ? "/login?redirect=/checkout" : "/checkout");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="font-heading text-maroon-900 text-2xl">Your cart</h1>
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
      <div className="border-maroon-50 rounded-lg border bg-white p-4">
        <CartSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total} />
        <Button className="mt-4 w-full" onClick={handleCheckout}>
          Proceed to checkout
        </Button>
        {authStatus === "unauthenticated" ? (
          <p className="text-maroon-500 mt-2 text-center text-xs">
            You&apos;ll need to sign in to check out.
          </p>
        ) : null}
      </div>
    </main>
  );
}
