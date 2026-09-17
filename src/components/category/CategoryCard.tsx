import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const imageUrl =
    category.image?.url ||
    `/images/categories/${category.slug}.webp` ||
    "/images/categories/bridal-sarees.webp";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group hover:shadow-elegant relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-sm transition-all duration-500 lg:aspect-square",
        className,
      )}
    >
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={category.name}
        fill
        sizes="(min-width: 1024px) 33vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
        <h3 className="font-display text-lg font-semibold text-white drop-shadow-xs lg:text-xl">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mb-2 line-clamp-2 hidden text-xs leading-relaxed text-white/75 lg:block">
            {category.description}
          </p>
        ) : null}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-medium text-white/80 sm:text-sm">Explore Collection</span>
          <span className="flex h-8 w-8 translate-x-4 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-xs transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Decorative gold border on hover */}
      <div className="border-gold/0 group-hover:border-gold/60 pointer-events-none absolute inset-2 rounded-xl border-2 transition-colors duration-500" />
    </Link>
  );
}
