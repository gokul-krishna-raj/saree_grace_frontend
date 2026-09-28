import { JsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";

export function WebSiteJsonLd() {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Saree Grace",
    url: siteUrl,
    description:
      "Authentic Elampillai sarees, soft silks, handloom cottons, and bridal collections direct from Salem master weavers.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={structuredData} />;
}
