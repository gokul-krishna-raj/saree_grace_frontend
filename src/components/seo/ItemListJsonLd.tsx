import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import type { Product } from "@/types";

// ItemList for a category/listing page — only the products actually rendered in the HTML.
export function ItemListJsonLd({ name, products }: { name: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/products/${product.slug}`),
          name: product.name,
        })),
      }}
    />
  );
}
