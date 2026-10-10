"use client";

import { PackageCheck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { trackViewContent } from "@/components/analytics/MetaPixel";
import { AddToCartControls } from "@/components/product/AddToCartControls";
import { ImageGallery } from "@/components/product/ImageGallery";
import { hasProductSpecs, ProductSpecs } from "@/components/product/ProductSpecs";
import { VariantSelector } from "@/components/product/VariantSelector";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useProductSelection } from "@/hooks/useProductSelection";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { trackViewItem } from "@/lib/analytics";
import { formatPrice } from "@/lib/formatPrice";
import { getProductPrimaryImage } from "@/lib/productImage";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";
import { useAppDispatch } from "@/store/hooks";
import { setCartDrawerOpen } from "@/store/slices/uiSlice";
import type { Occasion, Product } from "@/types";

export function ProductDetailClient({
  product,
  description,
}: {
  product: Product;
  /** Server-rendered description body (keeps HTML sanitizing out of the client bundle). */
  description?: ReactNode;
}) {
  // Only entries the API actually populated (not just an ObjectId string) can be shown —
  // rendering a raw id would be a meaningless label and a broken link.
  const occasions = (product.occasions ?? []).filter(
    (occasion): occasion is Occasion => typeof occasion !== "string",
  );
  const {
    attributeNames,
    variants,
    selection,
    select,
    activeVariant,
    requiresVariantSelection,
    images,
    price,
    compareAtPrice,
    discountPercent,
    stock,
  } = useProductSelection(product);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isWishlisted, toggle, isLoading: isWishlistLoading } = useWishlistToggle(product._id);

  useEffect(() => {
    trackViewItem(product);
    trackViewContent(product);
    recordRecentlyViewed({
      slug: product.slug,
      name: product.name,
      image: getProductPrimaryImage(product)?.url,
      price: product.type === "variant" ? product.startingPrice : (product.price ?? 0),
      isFromPrice: product.type === "variant" && product.maxPrice > product.startingPrice,
    });
    // Fire once per product page view, not on every selection/re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  const category = typeof product.category === "object" ? product.category : undefined;
  const specs = {
    fabric: product.fabric,
    color: product.color,
    isHandloom: product.isHandloom,
    occasions,
    sku: activeVariant?.sku || product.sku,
  };
  const outOfStock = !requiresVariantSelection && (stock ?? 0) <= 0;

  function handleSelect(attributeName: string, value: string) {
    select(attributeName, value);
    // Reset image index to primary variant image when switching variants
    setSelectedImageIndex(0);
  }

  // Sticky mobile purchase bar: shown only once the main add-to-cart block has scrolled out of
  // view, so it never duplicates a CTA the shopper can already see.
  const purchaseRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const el = purchaseRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="container-page">
      <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:gap-12 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] xl:gap-20">
        <div className="md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:self-start">
          <ImageGallery
            images={images}
            alt={product.name}
            isHandloom={product.isHandloom}
            discountPercent={discountPercent}
            isWishlisted={isWishlisted}
            onWishlistToggle={toggle}
            isWishlistLoading={isWishlistLoading}
            selectedIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
          />
        </div>

        <div className="flex flex-col">
          {category?.name && category.slug ? (
            <Link
              href={`/categories/${category.slug}`}
              className="eyebrow mb-3 w-fit hover:underline"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="text-heading-lg text-foreground lg:text-[2.25rem]">{product.name}</h1>

          {product.reviewCount > 0 ? (
            <a
              href="#reviews"
              className="text-muted-foreground mt-3 flex w-fit items-center gap-1.5 text-sm"
            >
              <span className="flex" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={
                      index < Math.round(product.ratingAvg)
                        ? "fill-gold-500 text-gold-500 h-4 w-4"
                        : "text-border h-4 w-4"
                    }
                  />
                ))}
              </span>
              <span className="text-foreground font-medium">{product.ratingAvg.toFixed(1)}</span>
              <span className="underline underline-offset-2">
                {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
              </span>
            </a>
          ) : null}

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-foreground text-2xl font-semibold tabular-nums">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price ? (
              <span className="text-muted-foreground text-base tabular-nums line-through">
                {formatPrice(compareAtPrice)}
              </span>
            ) : null}
            {discountPercent > 0 ? (
              <span className="text-sale text-sm font-semibold">Save {discountPercent}%</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm">
            {requiresVariantSelection ? (
              <span className="text-muted-foreground">Select an option to check availability</span>
            ) : outOfStock ? (
              <span className="text-sale font-medium">Currently out of stock</span>
            ) : (
              <span className="text-success font-medium">In stock, ready to dispatch</span>
            )}
          </p>

          <div className="border-border mt-6 flex flex-col gap-6 border-t pt-6">
            {product.type === "variant" ? (
              <VariantSelector
                attributeNames={attributeNames}
                variants={variants}
                selection={selection}
                onSelect={handleSelect}
              />
            ) : null}

            <div ref={purchaseRef}>
              <AddToCartControls
                product={product}
                variant={activeVariant}
                requiresVariantSelection={requiresVariantSelection}
              />
            </div>
          </div>

          <ul className="bg-cream mt-6 flex flex-col gap-3.5 rounded-md p-5 text-sm">
            <li className="flex gap-3">
              <PackageCheck
                className="text-accent h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                <span className="text-foreground font-medium">
                  Dispatched in 1–2 business days.
                </span>{" "}
                <span className="text-muted-foreground">
                  Delivered across India in 3–7 business days.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <RotateCcw
                className="text-accent h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                <span className="text-foreground font-medium">7-day returns</span>{" "}
                <span className="text-muted-foreground">
                  on unused items in original packaging.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                className="text-accent h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">Secure checkout</span> with UPI, cards
                and net banking via Razorpay.
              </span>
            </li>
          </ul>

          <div className="border-border mt-8 border-t">
            {description ? (
              <Disclosure title="Description" defaultOpen>
                {description}
              </Disclosure>
            ) : null}
            {hasProductSpecs(specs) ? (
              <Disclosure title="Product details" defaultOpen={!description}>
                <ProductSpecs {...specs} />
              </Disclosure>
            ) : null}
            <Disclosure title="Shipping & delivery">
              <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
                <p>
                  Every order ships from Elampillai, Salem. Orders are packed and handed to our
                  courier within 1–2 business days of payment, and usually arrive within 3–7
                  business days. Shipping charges depend on your state and are shown at checkout
                  before you pay.
                </p>
                <Link
                  href="/shipping-policy"
                  className="text-foreground underline underline-offset-2"
                >
                  Shipping policy
                </Link>
              </div>
            </Disclosure>
            <Disclosure title="Returns & exchanges">
              <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
                <p>
                  Unused items in their original condition and packaging can be returned within 7
                  days of delivery. Damaged or incorrect items reported within 48 hours are replaced
                  or refunded at no extra cost. Small variations in weave or shade are natural to
                  handloom and aren&apos;t considered defects.
                </p>
                <Link
                  href="/refund-policy"
                  className="text-foreground underline underline-offset-2"
                >
                  Return &amp; refund policy
                </Link>
              </div>
            </Disclosure>
          </div>
        </div>
      </div>

      {showStickyBar ? (
        <StickyPurchaseBar
          product={product}
          price={price}
          outOfStock={outOfStock}
          onChooseOptions={() =>
            purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
          variant={activeVariant}
          requiresVariantSelection={requiresVariantSelection}
        />
      ) : null}
    </div>
  );
}

function StickyPurchaseBar({
  product,
  price,
  outOfStock,
  variant,
  requiresVariantSelection,
  onChooseOptions,
}: {
  product: Product;
  price: number;
  outOfStock: boolean;
  variant: ReturnType<typeof useProductSelection>["activeVariant"];
  requiresVariantSelection: boolean;
  onChooseOptions: () => void;
}) {
  const dispatch = useAppDispatch();
  const { addToCart, isLoading, isAuthPending } = useAddToCart();

  async function handleAdd() {
    if (requiresVariantSelection) {
      onChooseOptions();
      return;
    }
    if (await addToCart(product, variant, 1)) dispatch(setCartDrawerOpen(true));
  }

  return (
    <div
      data-sticky-cta
      className="border-border bg-background/95 animate-slide-in-up fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-page flex h-[4.5rem] items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground truncate text-xs">{product.name}</p>
          <p className="text-foreground text-base font-semibold tabular-nums">
            {formatPrice(price)}
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0 px-6"
          onClick={handleAdd}
          disabled={outOfStock || isLoading || isAuthPending}
          isLoading={isLoading}
        >
          {outOfStock ? "Out of stock" : requiresVariantSelection ? "Choose option" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
