import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Hero() {
  return (
    <section className="bg-gradient-maroon text-primary-foreground relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <div className="bg-pattern-indian absolute inset-0 opacity-10" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center lg:flex-row lg:gap-12 lg:text-left">
        <div className="flex flex-1 flex-col items-center gap-5 lg:items-start">
          <span className="border-gold/30 bg-accent/20 text-gold-light inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase">
            Woven in Elampillai, Tamil Nadu
          </span>
          <h1 className="font-display text-4xl leading-[1.1] font-bold text-white sm:text-5xl lg:text-6xl">
            Elampillai sarees, woven with generations of craft
          </h1>
          <p className="text-primary-foreground/85 max-w-lg text-base leading-relaxed sm:text-lg">
            Every Saree Grace piece is crafted with Elampillai expertise — designed for everyday
            elegance and special occasions alike.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link href="/products" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
              Shop the collection
            </Link>
            <Link
              href="/categories"
              className={cn(buttonVariants({ variant: "hero-outline", size: "lg" }))}
            >
              Explore Categories
            </Link>
          </div>
        </div>
        <div className="border-gold/30 shadow-elegant relative h-80 w-full max-w-sm overflow-hidden rounded-2xl border sm:h-96 lg:h-[32rem] lg:flex-1">
          <Image
            src="/hero-saree-model.webp"
            alt="Model wearing a premium Saree Grace saree"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
