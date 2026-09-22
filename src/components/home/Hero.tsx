"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

const emptySubscribe = () => () => {};

export interface HeroSlide {
  id: number;
  desktopImage: string;
  alt: string;
  eyebrow: string;
  titlePrefix: string;
  highlightWords: string;
  description: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  couponCode?: string;
  offerBadge?: string;
  offerSubtext?: string;
  objectPosition: string;
  gradientOverlay: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    desktopImage: "/images/hero/slide_1.webp",
    alt: "Handcrafted Elampillai sarees woven with tradition and timeless beauty",
    eyebrow: "Heritage Handlooms",
    titlePrefix: "The Elegance of",
    highlightWords: "Elampillai",
    description: "Handcrafted sarees woven with tradition and timeless beauty.",
    primaryCtaText: "Explore Collection",
    primaryCtaHref: "/products",
    objectPosition: "object-[80%_center] sm:object-center",
    gradientOverlay:
      "bg-gradient-to-t from-[#FAF6F0]/90 via-[#FAF6F0]/50 to-transparent sm:bg-gradient-to-r sm:from-[#FAF6F0]/85 sm:via-[#FAF6F0]/35 sm:to-transparent",
  },
  {
    id: 2,
    desktopImage: "/images/hero/slide_2.webp",
    alt: "Master artisan handweaving traditional sarees on a wooden loom",
    eyebrow: "Master Craftsmanship",
    titlePrefix: "Tradition, Woven",
    highlightWords: "Beautifully",
    description: "Discover the craftsmanship behind every Saree Grace collection.",
    primaryCtaText: "Discover Our Collection",
    primaryCtaHref: "/products",
    objectPosition: "object-[85%_center] sm:object-center",
    gradientOverlay:
      "bg-gradient-to-t from-[#FAF6F0]/90 via-[#FAF6F0]/50 to-transparent sm:bg-gradient-to-r sm:from-[#FAF6F0]/85 sm:via-[#FAF6F0]/35 sm:to-transparent",
  },
  {
    id: 3,
    desktopImage: "/images/hero/slide_3.webp",
    alt: "Find Your Perfect Saree - Explore beautiful Elampillai sarees crafted for every occasion",
    eyebrow: "Curated Collection",
    titlePrefix: "Find Your",
    highlightWords: "Perfect Saree",
    description: "Explore beautiful Elampillai sarees crafted for every occasion.",
    primaryCtaText: "Shop Sarees",
    primaryCtaHref: "/products",
    objectPosition: "object-[80%_center] sm:object-center",
    gradientOverlay:
      "bg-gradient-to-t from-[#FAF6F0]/90 via-[#FAF6F0]/50 to-transparent sm:bg-gradient-to-r sm:from-[#FAF6F0]/85 sm:via-[#FAF6F0]/35 sm:to-transparent",
  },
];

export function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const isHoveredRef = useRef(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    queueMicrotask(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay rotation (5000ms) that pauses on hover, touch, or reduced motion
  useEffect(() => {
    if (!emblaApi) return;

    // Check prefers-reduced-motion
    const mediaQuery =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (mediaQuery?.matches) return;

    const interval = setInterval(() => {
      if (!isHoveredRef.current && emblaApi) {
        emblaApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  return (
    <section
      tabIndex={0}
      className="relative w-full overflow-hidden bg-[#FAF6F0] select-none focus-visible:ring-2 focus-visible:ring-[#5A1725]/50 focus-visible:outline-none"
      aria-roledescription="carousel"
      aria-label="Hero featured collections"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      onTouchStart={() => {
        isHoveredRef.current = true;
      }}
      onTouchEnd={() => {
        setTimeout(() => {
          isHoveredRef.current = false;
        }, 1000);
      }}
    >
      {/* Viewport with fixed responsive height to guarantee zero CLS */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {HERO_SLIDES.map((slide, index) => {
            const isFirst = index === 0;
            // Eager LCP image for slide 0, defer slides 1 & 2 until hydration
            const shouldRenderImage = isFirst || isMounted;

            return (
              <div
                key={slide.id}
                className="relative flex h-[520px] min-w-0 flex-[0_0_100%] items-center sm:h-[580px] md:h-[640px] lg:h-[700px]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${slide.eyebrow} - Slide ${index + 1} of ${HERO_SLIDES.length}`}
              >
                {/* Background Image & Non-Intrusive Subtle Ambient Overlays */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-[#FAF6F0]">
                  {shouldRenderImage ? (
                    <Image
                      src={slide.desktopImage}
                      alt={slide.alt}
                      fill
                      priority={isFirst}
                      fetchPriority={isFirst ? "high" : "auto"}
                      loading={isFirst ? "eager" : "lazy"}
                      sizes="100vw"
                      className={cn(
                        "object-cover transition-transform duration-700 ease-out",
                        slide.objectPosition,
                      )}
                    />
                  ) : null}

                  {/* Image-Aware Soft Translucent Cream Gradient Overlay */}
                  <div
                    className={cn("pointer-events-none absolute inset-0", slide.gradientOverlay)}
                  />

                  {/* Subtle edge fade to integrate with page flow */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FAF6F0]/40 to-transparent" />
                </div>

                {/* Content Container (Image-Aware Left Alignment in natural negative space) */}
                <div className="relative z-10 container mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16 lg:px-12">
                  <div className="max-w-xl text-left">
                    {/* Eyebrow Pill */}
                    <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-amber-800/25 bg-[#FAF6F0]/80 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#5A1725] uppercase shadow-xs backdrop-blur-xs sm:mb-4 sm:text-sm">
                      <Sparkles
                        className="h-3.5 w-3.5 shrink-0 text-amber-700"
                        aria-hidden="true"
                      />
                      <span>{slide.eyebrow}</span>
                    </div>

                    {/* Headline: Semantic Single <h1> on Slide 0, <h2> on Slides 1 & 2 */}
                    {isFirst ? (
                      <h1 className="font-display mb-3 text-3xl leading-[1.12] font-bold tracking-tight text-[#5A1725] sm:mb-4 sm:text-5xl md:text-6xl">
                        {slide.titlePrefix}{" "}
                        <span className="block sm:inline-block">{slide.highlightWords}</span>
                      </h1>
                    ) : (
                      <h2 className="font-display mb-3 text-3xl leading-[1.12] font-bold tracking-tight text-[#5A1725] sm:mb-4 sm:text-5xl md:text-6xl">
                        {slide.titlePrefix}{" "}
                        <span className="block sm:inline-block">{slide.highlightWords}</span>
                      </h2>
                    )}

                    {/* Description */}
                    <p className="mb-6 max-w-lg text-sm leading-relaxed font-normal text-[#3D3030] sm:mb-8 sm:text-base md:text-lg">
                      {slide.description}
                    </p>

                    {/* CTA Actions */}
                    <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                      <Link
                        href={slide.primaryCtaHref}
                        className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#5A1725] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#43101B] hover:shadow-lg active:scale-95 sm:px-8 sm:text-base"
                      >
                        {slide.primaryCtaText}
                        <ArrowRight
                          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows (Desktop / Tablet) */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute top-1/2 left-4 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-amber-900/15 bg-white/85 text-[#5A1725] shadow-md backdrop-blur-xs transition-all hover:bg-white hover:text-[#43101B] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#5A1725] focus-visible:outline-none active:scale-95 sm:left-6 md:flex"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute top-1/2 right-4 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-amber-900/15 bg-white/85 text-[#5A1725] shadow-md backdrop-blur-xs transition-all hover:bg-white hover:text-[#43101B] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#5A1725] focus-visible:outline-none active:scale-95 sm:right-6 md:flex"
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Pagination Indicators / Dots */}
      <div
        className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 sm:bottom-7"
        role="tablist"
        aria-label="Hero slide selection"
      >
        {HERO_SLIDES.map((slide, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.eyebrow}`}
              aria-selected={isSelected}
              className={cn(
                "h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#5A1725] focus-visible:outline-none",
                isSelected
                  ? "w-8 bg-[#5A1725] shadow-xs sm:w-10"
                  : "w-2 bg-[#5A1725]/30 hover:bg-[#5A1725]/60",
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
