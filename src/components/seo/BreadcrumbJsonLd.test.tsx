import { render } from "@testing-library/react";

import { env } from "@/lib/env";

import { BreadcrumbJsonLd } from "./BreadcrumbJsonLd";

describe("BreadcrumbJsonLd", () => {
  it("renders valid schema.org BreadcrumbList structured data", () => {
    const items = [
      { name: "Home", url: "/" },
      { name: "Categories", url: "/categories" },
      { name: "Soft Silk", url: "/categories/soft-silk" },
    ];

    const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

    const { container } = render(<BreadcrumbJsonLd items={items} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    const json = JSON.parse(script!.innerHTML);

    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(3);
    expect(json.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteUrl}/`,
    });
    expect(json.itemListElement[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "Soft Silk",
      item: `${siteUrl}/categories/soft-silk`,
    });
  });
});
