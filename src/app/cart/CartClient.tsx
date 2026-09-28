"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";

export function CartClient() {
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
      <main className="container-page flex-1 py-10 lg:py-14">
        <SkeletonGroup label="Loading your cart" className="flex max-w-3xl flex-col gap-4">
          <div className="shimmer h-9 w-48 rounded" />
          <div className="shimmer h-28 w-full rounded-md" />
          <div className="shimmer h-28 w-full rounded-md" />
        </SkeletonGroup>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col">
        <ErrorState
          headingAs="h1"
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
      <main className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-heading-xl text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-sm text-[15px]">
          Explore our Elampillai saree collection and add something you love.
        </p>
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "mt-4")}>
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

  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <main className="container-page flex-1 py-10 lg:py-14">
      <h1 className="text-heading-xl text-foreground">
        Your cart{" "}
        <span className="text-muted-foreground font-body align-middle text-base font-normal">
          ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
      </h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <div className="divide-border border-border divide-y border-y">
          {lines.map((line) => (
            <CartLineItem
              key={line.id}
              line={line}
              onUpdateQty={(qty) => updateQty(line, qty)}
              onRemove={() => removeItem(line)}
            />
          ))}
        </div>
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <div className="bg-cream rounded-md p-6">
            <h2 className="font-display text-foreground mb-5 text-xl">Order summary</h2>
            <CartSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total} />
            <Button size="lg" className="mt-6 w-full" onClick={handleCheckout}>
              Proceed to checkout
            </Button>
            {authStatus === "unauthenticated" ? (
              <p className="text-muted-foreground mt-3 text-center text-xs">
                You&apos;ll need to sign in to check out.
              </p>
            ) : null}
            <p className="text-muted-foreground mt-4 flex items-center justify-center gap-1.5 text-xs">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Secure payment via Razorpay
            </p>
          </div>
          <Link
            href="/products"
            className="text-foreground mt-4 block text-center text-sm underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
