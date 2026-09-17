"use client";

import { Heart, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
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

  // Auto-reset when images list changes (e.g. user selected a different color)
  const currentImagesKey = images.map((img) => img.url).join("|");
  if (currentImagesKey !== prevImagesKey) {
    setPrevImagesKey(currentImagesKey);
    setInternalIndex(0);
  }

  if (images.length === 0) {
    return (
      <div className="bg-muted border-border/40 text-muted-foreground flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border text-sm sm:aspect-[3/4]">
        <span className="font-heading text-muted-foreground/80 text-base">Saree Grace</span>
        <span>No image available</span>
      </div>
    );
  }

  const activeIndex = selectedIndex !== undefined ? selectedIndex : internalIndex;
  const safeIndex = activeIndex < images.length ? activeIndex : 0;
  const currentImage = images[safeIndex] ?? images[0];

  function handleThumbnailClick(index: number) {
    setInternalIndex(index);
    onSelectImage?.(index);
  }

  async function handleShare() {
    const shareData = {
      title: alt,
      text: `Check out this beautiful saree: ${alt}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // User cancelled share or permission denied
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main Image Viewport */}
      <div className="border-border/40 group bg-muted relative aspect-square w-full overflow-hidden rounded-xl border shadow-sm sm:aspect-[3/4] sm:rounded-2xl">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="relative block h-full w-full cursor-zoom-in text-left focus-visible:outline-none"
          aria-label={`View larger image of ${alt}`}
        >
          <div key={currentImage.url} className="animate-fade-in relative h-full w-full">
            <Image
              src={currentImage.url}
              alt={`${alt} — photo ${safeIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:group-hover:scale-110"
            />
          </div>
        </button>

        {/* Top-Left Badges */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 sm:top-4 sm:left-4">
          {isHandloom ? (
            <span className="bg-royal text-primary-foreground rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
              Handloom
            </span>
          ) : null}
          {featured ? (
            <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
              Featured
            </span>
          ) : null}
          {discountPercent && discountPercent > 0 ? (
            <span className="bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>

        {/* Top-Right Floating Action Buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-2 sm:top-4 sm:right-4">
          {onWishlistToggle ? (
            <button
              type="button"
              onClick={onWishlistToggle}
              disabled={isWishlistLoading}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "bg-card/90 rounded-full p-2 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 sm:p-2.5",
                isWishlisted
                  ? "text-primary hover:bg-primary hover:text-primary-foreground"
                  : "text-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Heart
                className={cn("h-4 w-4 sm:h-5 sm:w-5", isWishlisted && "fill-current")}
                aria-hidden="true"
              />
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="bg-card/90 text-foreground hover:bg-primary hover:text-primary-foreground rounded-full p-2 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 sm:p-2.5"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Thumbnails Row — displayed at bottom of main image */}
      {images.length > 0 ? (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 sm:grid sm:grid-cols-5 sm:gap-3 md:grid-cols-6">
          {images.map((image, index) => {
            const isCurrent = index === safeIndex;
            return (
              <button
                key={image.publicId || image.url || index}
                type="button"
                onClick={() => handleThumbnailClick(index)}
                aria-label={`View photo ${index + 1} of ${images.length}`}
                aria-current={isCurrent}
                className={cn(
                  "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-auto sm:rounded-xl",
                  isCurrent
                    ? "border-primary ring-primary/30 scale-[1.03] shadow-xs ring-2"
                    : "border-border/60 hover:border-border opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 96px, 64px"
                  className="object-cover"
                />
                {isCurrent ? <div className="bg-primary/10 absolute inset-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Full-Screen Modal Zoom */}
      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={alt} className="max-w-3xl">
        <div className="relative aspect-[3/4] max-h-[80vh] w-full">
          <Image
            src={currentImage.url}
            alt={`${alt} — enlarged`}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
