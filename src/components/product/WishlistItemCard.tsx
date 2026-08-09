"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/apiError";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "@/lib/toast";
import { useAddCartItemMutation } from "@/store/api/cartApi";
import { useRemoveFromWishlistMutation } from "@/store/api/wishlistApi";
import { useAppDispatch } from "@/store/hooks";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";
import type { WishlistProductSummary } from "@/types";

export function WishlistItemCard({ product }: { product: WishlistProductSummary }) {
  const dispatch = useAppDispatch();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();

  // `startingPrice` equals `price` for a simple product and the lowest active variant price for
  // a variant product — verified live, it's always present (a Mongoose virtual), so there's no
  // need to recompute it here.
  const price = product.startingPrice;
  const primaryImage = product.images[0];
  // Wishlist items don't carry a user-chosen variant — moving a variant product to cart
  // defaults to its first active variant rather than blocking on a selection the user would
  // have to make on this page too (they can change it from the product page/cart afterwards).
  const defaultVariant =
    product.type === "variant"
      ? (product.variants ?? []).find((variant) => variant.isActive)
      : undefined;
  const canMoveToCart = product.type === "simple" || Boolean(defaultVariant);

  async function handleMoveToCart() {
    try {
      await addCartItem({
        productId: product._id,
        variantId: defaultVariant?._id ?? null,
        qty: 1,
      }).unwrap();
      await removeFromWishlist({ productId: product._id }).unwrap();
      dispatch(setCartDrawerOpen(true));
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          "Couldn't move this to your cart.",
        ),
      );
    }
  }

  return (
    <div className="border-maroon-50 flex flex-col overflow-hidden rounded-lg border bg-white">
      <div className="bg-maroon-50 relative aspect-[3/4] w-full">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="block h-full w-full"
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </Link>
        <button
          type="button"
          onClick={() => removeFromWishlist({ productId: product._id })}
          disabled={isRemoving}
          aria-label={`Remove ${product.name} from wishlist`}
          className="text-maroon-700 absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/products/${product.slug}`}
          className="font-heading text-maroon-900 line-clamp-2 text-base"
        >
          {product.name}
        </Link>
        <p className="text-maroon-600 text-sm">
          {product.type === "variant" ? "From " : ""}
          {formatPrice(price)}
        </p>
        <Button
          variant="secondary"
          className="mt-auto w-full"
          onClick={handleMoveToCart}
          isLoading={isAddingToCart}
          disabled={!canMoveToCart}
        >
          {canMoveToCart ? "Move to cart" : "Currently unavailable"}
        </Button>
      </div>
    </div>
  );
}
