import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Hero() {
  return (
    <section className="bg-maroon-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:py-16 lg:flex-row lg:gap-12 lg:py-24 lg:text-left">
        <div className="flex flex-1 flex-col items-center gap-4 lg:items-start">
          <span className="bg-gold-500/20 text-gold-100 w-fit rounded-full px-3 py-1 text-xs font-medium">
            Woven in Elampillai, Tamil Nadu
          </span>
          <h1 className="font-heading text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            Handloom sarees, woven with generations of craft
          </h1>
          <p className="text-cream/80 max-w-md text-base">
            Every Saree Grace piece is handwoven by Elampillai artisans — an authentic drape, made
            for everyday elegance and special occasions alike.
          </p>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            Shop the collection
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="from-gold-400/30 via-maroon-600 to-maroon-900 h-40 w-full max-w-sm rounded-lg bg-gradient-to-br sm:h-56 lg:h-72 lg:flex-1"
        />
      </div>
    </section>
  );
}
