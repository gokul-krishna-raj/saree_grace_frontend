import { render } from "@testing-library/react";

import { WebSiteJsonLd } from "./WebSiteJsonLd";

describe("WebSiteJsonLd", () => {
  it("renders valid schema.org WebSite structured data with SearchAction", () => {
    const { container } = render(<WebSiteJsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    const json = JSON.parse(script!.innerHTML);

    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("WebSite");
    expect(json.name).toBe("Saree Grace");
    expect(json.potentialAction).toBeDefined();
    expect(json.potentialAction["@type"]).toBe("SearchAction");
    expect(json.potentialAction.target.urlTemplate).toContain("/products?q={search_term_string}");
  });
});
