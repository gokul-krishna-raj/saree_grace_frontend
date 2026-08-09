"use client";

import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import { useGetOccasionsQuery } from "@/store/api/occasionsApi";
import type { Occasion } from "@/types";

function OccasionCard({ occasion }: { occasion: Occasion }) {
  return (
    <Link
      href={`/products?occasion=${occasion._id}`}
      className="group border-maroon-50 relative flex w-40 shrink-0 flex-col overflow-hidden rounded-lg border bg-white sm:w-48"
    >
      <span className="bg-maroon-50 relative block aspect-[4/3] w-full overflow-hidden">
        {occasion.image?.url ? (
          <Image
            src={occasion.image.url}
            alt={occasion.name}
            fill
            sizes="(min-width: 640px) 192px, 160px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <span
            className="text-maroon-700 font-heading absolute inset-0 flex items-center justify-center text-2xl"
            aria-hidden="true"
          >
            {occasion.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="flex flex-col gap-0.5 p-3">
        <span className="text-maroon-900 font-heading text-sm">{occasion.name}</span>
        {occasion.description ? (
          <span className="text-maroon-600 line-clamp-2 text-xs">{occasion.description}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function OccasionShowcase() {
  const { data: occasions, isLoading, isError } = useGetOccasionsQuery();
  const activeOccasions = occasions?.filter((occasion) => occasion.isActive) ?? [];

  if (isLoading) {
    return (
      <div className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3] w-40 shrink-0 sm:w-48" />
        ))}
      </div>
    );
  }

  if (isError || activeOccasions.length === 0) {
    return (
      <p className="text-maroon-600 px-4 text-center text-sm">
        {isError
          ? "Unable to load occasions. Try again later."
          : "Occasions are being set up — check back soon."}
      </p>
    );
  }

  return (
    <div className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-1">
      {activeOccasions.map((occasion) => (
        <OccasionCard key={occasion._id} occasion={occasion} />
      ))}
    </div>
  );
}
