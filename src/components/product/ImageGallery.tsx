"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types";

export function ImageGallery({ images, alt }: { images: ProductImage[]; alt: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (images.length === 0) {
    return <div className="bg-maroon-50 aspect-square w-full rounded-lg" aria-hidden="true" />;
  }

  function scrollTo(index: number) {
    setActiveIndex(index);
    emblaApi?.scrollTo(index);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="bg-maroon-50 relative block aspect-square w-full overflow-hidden rounded-lg lg:cursor-zoom-in"
        aria-label={`View larger image of ${alt}`}
      >
        <div ref={emblaRef} className="h-full w-full overflow-hidden">
          <div className="flex h-full">
            {images.map((image, index) => (
              <div key={image.publicId} className="relative h-full w-full flex-none">
                <Image
                  src={image.url}
                  alt={`${alt} — photo ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  preload={index === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </button>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === (activeIndex < images.length ? activeIndex : 0)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === (activeIndex < images.length ? activeIndex : 0)
                  ? "border-maroon-700"
                  : "border-transparent",
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={alt} className="max-w-2xl">
        <div className="relative aspect-square w-full">
          <Image
            src={(images[activeIndex < images.length ? activeIndex : 0] ?? images[0]).url}
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
