import { JsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";

// Organization/store schema, rendered on the homepage only — complements the per-product
// `Product` JSON-LD already emitted on /products/[slug]. Static, server-generated structured
// data built only from literals and env config, no user input reaches this HTML.
export function OrganizationJsonLd() {
  const sameAs = [
    env.NEXT_PUBLIC_INSTAGRAM_URL,
    env.NEXT_PUBLIC_FACEBOOK_URL,
    env.NEXT_PUBLIC_YOUTUBE_URL,
  ].filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Saree Grace",
    description:
      "Authentic Elampillai sarees, handpicked for everyday elegance and special occasions.",
    url: env.NEXT_PUBLIC_SITE_URL,
    logo: `${env.NEXT_PUBLIC_SITE_URL}/saree_grace_favicon.png`,
    image: `${env.NEXT_PUBLIC_SITE_URL}/saree_grace_logo.png`,
    email: env.NEXT_PUBLIC_CONTACT_EMAIL,
    ...(env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? { telephone: `+${env.NEXT_PUBLIC_WHATSAPP_NUMBER}` }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Elampillai, Salem",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return <JsonLd data={structuredData} />;
}
