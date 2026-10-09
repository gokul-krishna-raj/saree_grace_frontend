"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { trackInitiateCheckout } from "@/components/analytics/MetaPixel";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCart } from "@/hooks/useCart";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { INDIAN_STATES } from "@/lib/indianStates";
import { getShippingFeeForState } from "@/lib/shippingFee";
import { type AddressFormValues, addressSchema } from "@/lib/validation/checkout";
import { useCreateOrderMutation } from "@/store/api/ordersApi";

export function CheckoutForm() {
  const { lines, itemsTotal, isEmpty, isLoading: isCartLoading } = useCart();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const { payForOrder, isProcessing } = useRazorpayCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

  // Shipping is state-tiered (order.service.ts on the backend) and only known once the shopper
  // picks a state here — until then the summary says so instead of guessing a number.
  const selectedState = watch("state");
  const shippingFee = selectedState ? getShippingFeeForState(selectedState) : null;
  const total = itemsTotal + (shippingFee ?? 0);

  // Once per visit to checkout, as soon as the cart has resolved with something in it.
  const hasTrackedCheckout = useRef(false);
  useEffect(() => {
    if (hasTrackedCheckout.current || isCartLoading || lines.length === 0) return;
    hasTrackedCheckout.current = true;
    trackInitiateCheckout({
      contentIds: lines.map((line) => line.productId),
      numItems: lines.reduce((sum, line) => sum + line.qty, 0),
      value: itemsTotal,
    });
  }, [isCartLoading, lines, itemsTotal]);

  if (isProcessing) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="border-maroon-200 border-t-maroon-700 h-12 w-12 animate-spin rounded-full border-4" />
        <h2 className="font-heading text-maroon-900 text-xl">Confirming your payment...</h2>
        <p className="text-maroon-600 max-w-sm text-sm">
          Please do not refresh or close this page while we verify your transaction and prepare your
          order.
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-maroon-700">Your cart is empty — there&apos;s nothing to check out.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: "primary" }))}>
          Shop sarees
        </Link>
      </div>
    );
  }

  async function onSubmit(values: AddressFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        shippingAddress: values,
        paymentMethod: "razorpay",
      }).unwrap();
      // From here on, the order exists (stock decremented, cart cleared server-side) —
      // payForOrder only handles the payment attempt for it, never re-creates it.
      await payForOrder(order);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const busy = isSubmitting || isCreatingOrder || isProcessing;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-maroon-900 text-lg">Shipping address</h2>
          <Input
            label="Full name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Address line 1"
            autoComplete="address-line1"
            error={errors.line1?.message}
            {...register("line1")}
          />
          <Input
            label="Address line 2 (optional)"
            autoComplete="address-line2"
            error={errors.line2?.message}
            {...register("line2")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register("city")}
            />
            <Select
              label="State"
              autoComplete="address-level1"
              error={errors.state?.message}
              defaultValue=""
              {...register("state")}
            >
              <option value="" disabled>
                Select a state
              </option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Postal code"
            inputMode="numeric"
            autoComplete="postal-code"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
        </section>

        <section className="border-maroon-50 flex flex-col gap-3 rounded-lg border bg-white p-4">
          <h2 className="font-heading text-maroon-900 text-lg">Order summary</h2>
          <ul className="text-maroon-700 flex flex-col gap-2 text-sm">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3">
                <div className="bg-maroon-50 relative h-12 w-10 shrink-0 overflow-hidden rounded">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <span className="line-clamp-1 flex-1">
                  {line.name} × {line.qty}
                </span>
              </li>
            ))}
          </ul>
          <CartSummary
            itemsTotal={itemsTotal}
            shippingFee={shippingFee}
            total={total}
            shippingPendingLabel="Select your state"
          />
        </section>

        {submitError ? (
          <p role="alert" className="text-sm text-red-600">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" isLoading={busy} disabled={busy}>
          Place order & pay
        </Button>
      </form>
    </>
  );
}
