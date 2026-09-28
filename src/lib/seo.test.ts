import { pageMetadata, stripBrand, truncateDescription } from "./seo";

describe("seo helpers", () => {
  it("strips a duplicated brand suffix so the title template doesn't repeat it", () => {
    expect(stripBrand("Kalyani Cotton Saree | Saree Grace")).toBe("Kalyani Cotton Saree");
    expect(stripBrand("Kalyani Cotton Saree")).toBe("Kalyani Cotton Saree");
  });

  it("falls back to the brand share image when a page has none of its own", () => {
    const meta = pageMetadata({ title: "FAQ", description: "Answers.", path: "/faq" });
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({ url: "/saree_grace_logo.png", width: 1200, height: 630 }),
    ]);
    expect(meta.alternates?.canonical).toBe("/faq");
  });

  it("caps descriptions at a word boundary and strips Markdown", () => {
    const long = `## Heading\n\n**Bold** ${"word ".repeat(60)}`;
    const out = truncateDescription(long, 160);
    expect(out.length).toBeLessThanOrEqual(161);
    expect(out).not.toMatch(/[#*]/);
    expect(out.endsWith("…")).toBe(true);
  });
});
