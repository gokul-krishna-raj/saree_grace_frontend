import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/types";

interface ProductRailProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  action?: { href: string; label: string };
  className?: string;
}

// Server-rendered product section fed by data fetched once in the page. (The previous carousels
// received server data *and* re-requested the same list from RTK Query on hydration.) Phones get
// a swipeable rail so the homepage stays scannable; from `lg` it's a 4-up grid.
export function ProductRail({
  id,
  eyebrow,
  title,
  description,
  products,
  action,
  className,
}: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={id} className={className ?? "section-y"}>
      <div className="container-page">
        <SectionHeading
          id={id}
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={action}
        />
      </div>
      <ul className="scrollbar-hide container-page flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto sm:scroll-px-6 lg:grid lg:snap-none lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {products.map((product) => (
          <li key={product._id} className="w-[64%] shrink-0 snap-start sm:w-[38%] lg:w-auto">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
