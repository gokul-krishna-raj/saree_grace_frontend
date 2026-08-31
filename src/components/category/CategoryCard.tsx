import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { Category } from "@/types";

const SIZE_CLASSES = {
  sm: "h-24 w-24 sm:h-28 sm:w-28",
  md: "h-28 w-28 sm:h-32 sm:w-32",
  lg: "h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36",
  xl: "h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40",
} as const;

interface CategoryCardProps {
  category: Category;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function CategoryCard({ category, size = "md", className }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn("group flex flex-col items-center gap-2.5 text-center", className)}
    >
      <span
        className={cn(
          "border-maroon-100 bg-maroon-50 group-hover:border-maroon-600 relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md",
          SIZE_CLASSES[size],
        )}
      >
        {category.image?.url ? (
          <Image
            src={category.image.url}
            alt={category.name}
            fill
            sizes="(min-width: 640px) 144px, 112px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="text-maroon-700 font-heading text-xl sm:text-2xl" aria-hidden="true">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="text-maroon-900 group-hover:text-maroon-700 line-clamp-2 max-w-[6.5rem] text-xs font-medium transition-colors sm:max-w-[8rem] sm:text-sm">
        {category.name}
      </span>
    </Link>
  );
}
