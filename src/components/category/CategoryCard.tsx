import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { Category } from "@/types";

const SIZE_CLASSES = {
  sm: "h-24 w-24",
  lg: "h-28 w-28",
} as const;

interface CategoryCardProps {
  category: Category;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function CategoryCard({ category, size = "sm", className }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn("group flex flex-col items-center gap-2 text-center", className)}
    >
      <span
        className={cn(
          "border-maroon-100 bg-maroon-50 group-hover:border-maroon-400 relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-colors",
          SIZE_CLASSES[size],
        )}
      >
        {category.image?.url ? (
          <Image src={category.image.url} alt="" fill sizes="112px" className="object-cover" />
        ) : (
          <span className="text-maroon-700 font-heading text-xl" aria-hidden="true">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="text-maroon-800 line-clamp-2 max-w-[5.5rem] text-xs font-medium">
        {category.name}
      </span>
    </Link>
  );
}
