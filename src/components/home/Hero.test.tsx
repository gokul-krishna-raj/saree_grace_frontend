import { render, screen } from "@testing-library/react";

import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders exactly one h1 with the brand promise", () => {
    render(<Hero />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/woven by hand/i);
  });

  it("links the primary and secondary CTAs to shop and categories", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Shop the collection" })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getByRole("link", { name: "Explore categories" })).toHaveAttribute(
      "href",
      "/categories",
    );
  });

  it("serves an art-directed, high-priority LCP image with descriptive alt text", () => {
    const { container } = render(<Hero />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", expect.stringMatching(/saree/i));
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(image).toHaveAttribute("loading", "eager");
    const source = container.querySelector('picture source[media="(min-width: 768px)"]');
    expect(source).not.toBeNull();
  });

  it("does not advertise coupons or discounts", () => {
    render(<Hero />);
    expect(screen.queryByText(/% OFF/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WELCOME10/i)).not.toBeInTheDocument();
  });
});
