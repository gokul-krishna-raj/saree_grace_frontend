"use client";

import { ChevronLeft, ChevronRight, Heart, Share2, ZoomIn } from "lucide-react";
import Image from "next/image";
import { type PointerEvent, useRef, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { PDP_MAIN_IMAGE_SIZES } from "@/lib/imageSizes";
import { toast } from "@/lib/toast";
import type { ProductImage } from "@/types";

interface ImageGalleryProps {
  images: ProductImage[];
  alt: string;
  isHandloom?: boolean;
  featured?: boolean;
  discountPercent?: number;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  isWishlistLoading?: boolean;
  selectedIndex?: number;
  onSelectImage?: (index: number) => void;
}

const SWIPE_THRESHOLD = 40;

export function ImageGallery({
  images,
  alt,
  isHandloom,
  featured,
  discountPercent,
  isWishlisted,
  onWishlistToggle,
  isWishlistLoading,
  selectedIndex,
  onSelectImage,
}: ImageGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [prevImagesKey, setPrevImagesKey] = useState(() => images.map((img) => img.url).join("|"));
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);
  // Fade only when the shopper switches photos — fading the first photo in would delay the
  // page's largest paint (LCP) by the length of the animation.
  const [hasSwitched, setHasSwitched] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);

  // Auto-reset when images list changes (e.g. user selected a different color)
  const currentImagesKey = images.map((img) => img.url).join("|");
  if (currentImagesKey !== prevImagesKey) {
    setPrevImagesKey(currentImagesKey);
    setInternalIndex(0);
  }

  if (images.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-md text-sm">
        <span className="font-heading text-muted-foreground/80 text-base">Saree Grace</span>
        <span>No image available</span>
      </div>
    );
  }

  const activeIndex = selectedIndex !== undefined ? selectedIndex : internalIndex;
  const safeIndex = activeIndex < images.length ? activeIndex : 0;
  const currentImage = images[safeIndex] ?? images[0];
  const hasMany = images.length > 1;

  function goTo(index: number) {
    setHasSwitched(true);
    const next = (index + images.length) % images.length;
    setInternalIndex(next);
    onSelectImage?.(next);
  }

  async function handleShare() {
    const shareData = {
      title: alt,
      text: `Check out this saree: ${alt}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled share or permission denied
    }
  }

  // Touch swipe between photos (no carousel library — one image element, index changes).
  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
    didSwipe.current = false;
  }

  function onPointerUp(event: PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || !hasMany) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true;
      goTo(safeIndex + (dx < 0 ? 1 : -1));
    }
  }

  // Desktop hover zoom: the photo scales 2× around the cursor. Written straight to the element's
  // style (no React state) so pointer movement never triggers a re-render.
  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const el = zoomRef.current;
    if (event.pointerType !== "mouse" || !el) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.transformOrigin = `${x}% ${y}%`;
    el.style.transform = "scale(2)";
  }

  function resetZoom() {
    const el = zoomRef.current;
    if (el) el.style.transform = "";
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* Main image */}
      <div className="bg-muted relative aspect-[4/5] w-full overflow-hidden rounded-md md:max-h-[calc(100dvh-var(--header-height)-3rem)] lg:flex-1">
        <button
          type="button"
          onClick={() => {
            if (didSwipe.current) return;
            setZoomOpen(true);
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerMove={onPointerMove}
          onPointerLeave={resetZoom}
          className="relative block h-full w-full cursor-zoom-in touch-pan-y text-left"
          aria-label={`View larger image of ${alt}`}
        >
          <div
            key={currentImage.url}
            ref={zoomRef}
            className={cn(
              "relative h-full w-full transition-transform duration-200 ease-out",
              hasSwitched && "animate-fade-in",
            )}
          >
            <Image
              src={currentImage.url}
              alt={`${alt} — photo ${safeIndex + 1}`}
              fill
              sizes={PDP_MAIN_IMAGE_SIZES}
              loading={safeIndex === 0 ? "eager" : undefined}
              fetchPriority={safeIndex === 0 ? "high" : undefined}
              // Whole photo, never cropped: most catalogue photos are square flat-lays with
              // details (and seller labels) right up to the edges.
              className="object-contain"
            />
          </div>
        </button>

        {/* Badges */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {discountPercent && discountPercent > 0 ? (
            <span className="bg-sale rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">
              {discountPercent}% OFF
            </span>
          ) : null}
          {isHandloom ? (
            <span className="bg-gold-50/95 text-maroon-900 rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide">
              Handloom
            </span>
          ) : null}
          {featured ? (
            <span className="bg-primary text-primary-foreground rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide">
              Featured
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-2">
          {onWishlistToggle ? (
            <button
              type="button"
              onClick={onWishlistToggle}
              disabled={isWishlistLoading}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="bg-card/90 text-foreground hover:bg-card flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
            >
              <Heart
                key={isWishlisted ? "on" : "off"}
                className={cn("h-5 w-5", isWishlisted && "fill-primary text-primary animate-pop")}
                aria-hidden="true"
              />
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="bg-card/90 text-foreground hover:bg-card flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
          >
            <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>

        {hasMany ? (
          <span className="bg-card/90 text-foreground pointer-events-none absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums lg:hidden">
            {safeIndex + 1} / {images.length}
          </span>
        ) : null}
        <span
          className="bg-card/90 text-foreground pointer-events-none absolute right-3 bottom-3 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs lg:flex"
          aria-hidden="true"
        >
          <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom · click to enlarge
        </span>
      </div>

      {/* Thumbnails — row under the photo on phones, column beside it on desktop */}
      {hasMany ? (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {images.map((image, index) => {
            const isCurrent = index === safeIndex;
            return (
              <button
                key={image.publicId || image.url || index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`View photo ${index + 1} of ${images.length}`}
                aria-current={isCurrent}
                className={cn(
                  "bg-muted relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-sm transition-opacity lg:w-full",
                  isCurrent
                    ? "ring-foreground ring-offset-background ring-1 ring-offset-2"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Full-screen viewer */}
      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={alt} className="max-w-3xl">
        <div className="relative aspect-[4/5] max-h-[78dvh] w-full">
          <Image
            src={currentImage.url}
            alt={`${alt} — enlarged`}
            fill
            sizes="(min-width: 768px) 720px, 95vw"
            quality={85}
            className="object-contain"
          />
          {hasMany ? (
            <>
              <button
                type="button"
                onClick={() => goTo(safeIndex - 1)}
                aria-label="Previous photo"
                className="bg-card/90 absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1)}
                aria-label="Next photo"
                className="bg-card/90 absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
