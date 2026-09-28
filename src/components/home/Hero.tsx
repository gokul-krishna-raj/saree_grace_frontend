import { getImageProps } from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const HERO_ALT =
  "A woman in a maroon and gold Elampillai silk saree standing beside a carved wooden pillar";

// A single, static editorial hero — no carousel. The LCP element is one image, rendered on the
// server with art direction: a portrait crop for phones and the wide frame from tablet up, so
// each device downloads exactly one appropriately sized file (the old 3-slide carousel shipped
// embla + autoplay JS for the most important paint on the page).
export function Hero() {
  const common = { alt: HERO_ALT, sizes: "100vw", quality: 75 };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: "/images/hero/slide_1.webp", width: 2752, height: 1536 });
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: "/hero-saree-model.webp", width: 1086, height: 1448 });

  return (
    <section aria-labelledby="hero-title" className="bg-cream relative isolate overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
        <img
          {...imgProps}
          srcSet={mobileSrcSet}
          alt={HERO_ALT}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_20%] md:object-[72%_22%]"
        />
      </picture>

      {/* Legibility scrims: dark from the bottom on phones (text sits over the photo), light from
          the left on larger screens (text sits in the wall's negative space). */}
      <div
        className="from-maroon-950/85 via-maroon-950/25 absolute inset-0 -z-10 bg-gradient-to-t to-transparent md:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#f3eadf]/90 via-[#f3eadf]/40 to-transparent md:block"
        aria-hidden="true"
      />

      <div className="container-page flex min-h-[min(82svh,44rem)] items-end pt-40 pb-10 md:min-h-[min(80vh,46rem)] md:items-center md:py-20">
        <div className="md:text-foreground max-w-xl text-white">
          <p className="eyebrow !text-gold-200 md:!text-accent mb-4">
            Handwoven in Elampillai, Salem
          </p>
          <h1 id="hero-title" className="text-display">
            Sarees woven by hand, <em className="font-display italic">made to be treasured</em>
          </h1>
          <p className="md:text-muted-foreground mt-5 max-w-md text-[15px] leading-relaxed text-white/85 sm:text-base md:text-lg">
            Soft silks, silk cottons and handloom cottons, sourced directly from weaver families in
            Tamil Nadu.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Shop the collection
            </Link>
            <Link
              href="/categories"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "hover:text-foreground md:border-foreground/25 md:text-foreground md:hover:border-foreground md:hover:bg-foreground md:hover:text-background w-full border-white/60 text-white hover:border-white hover:bg-white sm:w-auto",
              )}
            >
              Explore categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
