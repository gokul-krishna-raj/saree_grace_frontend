"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { type AddressFormValues, addressSchema } from "@/lib/validation/checkout";
import { useCreateOrderMutation } from "@/store/api/ordersApi";

export function CheckoutForm() {
  const { lines, itemsTotal, shippingFee, total, isEmpty } = useCart();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const { payForOrder, isProcessing } = useRazorpayCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

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
      const order = await createOrder({ shippingAddress: values }).unwrap();
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
            <Input
              label="State"
              autoComplete="address-level1"
              error={errors.state?.message}
              {...register("state")}
            />
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
          <ul className="text-maroon-700 flex flex-col gap-1 text-sm">
            {lines.map((line) => (
              <li key={line.id} className="flex justify-between">
                <span className="line-clamp-1">
                  {line.name} × {line.qty}
                </span>
              </li>
            ))}
          </ul>
          <CartSummary itemsTotal={itemsTotal} shippingFee={shippingFee} total={total} />
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
