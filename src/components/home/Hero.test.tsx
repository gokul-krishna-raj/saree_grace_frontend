import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Hero, HERO_SLIDES } from "./Hero";

// Mock embla-carousel-react
const scrollNextMock = jest.fn();
const scrollPrevMock = jest.fn();
const scrollToMock = jest.fn();
let currentSnap = 0;

const mockEmblaApi = {
  scrollNext: scrollNextMock,
  scrollPrev: scrollPrevMock,
  scrollTo: scrollToMock,
  selectedScrollSnap: () => currentSnap,
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: () => [jest.fn(), mockEmblaApi],
}));

describe("Hero Carousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentSnap = 0;
  });

  it("renders the carousel container and initial slide content with Saree Grace branding", () => {
    render(<Hero />);

    // Carousel landmark
    const carousel = screen.getByRole("region", { name: "Hero featured collections" });
    expect(carousel).toBeInTheDocument();

    // Eyebrow
    expect(screen.getByText("Heritage Handlooms")).toBeInTheDocument();

    // Slide 1 heading: Single H1 semantic heading
    const h1Heading = screen.getByRole("heading", {
      level: 1,
      name: /The Elegance of Elampillai/i,
    });
    expect(h1Heading).toBeInTheDocument();

    // Slide 1 description
    expect(
      screen.getByText("Handcrafted sarees woven with tradition and timeless beauty."),
    ).toBeInTheDocument();

    // Slide 1 CTA button
    const cta = screen.getByRole("link", { name: /Explore Collection/i });
    expect(cta).toHaveAttribute("href", "/products");
  });

  it("ensures only one H1 heading exists across all slides for SEO compliance", () => {
    render(<Hero />);

    const h1Elements = screen.getAllByRole("heading", { level: 1 });
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements[0]).toHaveTextContent("The Elegance of Elampillai");

    const h2Elements = screen.getAllByRole("heading", { level: 2 });
    expect(h2Elements).toHaveLength(2);
    expect(h2Elements[0]).toHaveTextContent("Tradition, Woven Beautifully");
    expect(h2Elements[1]).toHaveTextContent("Find Your Perfect Saree");
  });

  it("renders slide 0 image with priority and correct alt text", () => {
    render(<Hero />);

    const firstSlide = HERO_SLIDES[0];
    const image = screen.getByAltText(firstSlide.alt);
    expect(image).toBeInTheDocument();
  });

  it("renders Slide 3 shopping-focused content with no coupons or discounts", () => {
    render(<Hero />);

    // Slide 3 heading and description
    expect(
      screen.getByRole("heading", { level: 2, name: /Find Your Perfect Saree/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Explore beautiful Elampillai sarees crafted for every occasion."),
    ).toBeInTheDocument();

    // Slide 3 CTA link
    const shopCta = screen.getByRole("link", { name: /Shop Sarees/i });
    expect(shopCta).toBeInTheDocument();
    expect(shopCta).toHaveAttribute("href", "/products");

    // Strictly no coupon/discount artifacts
    expect(screen.queryByText(/10% OFF/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WELCOME10/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/on your first order/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Use code:/i)).not.toBeInTheDocument();
  });

  it("renders navigation arrows and calls embla scrollNext / scrollPrev on click", async () => {
    render(<Hero />);

    const prevButton = screen.getByRole("button", { name: "Previous slide" });
    const nextButton = screen.getByRole("button", { name: "Next slide" });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    await userEvent.click(nextButton);
    expect(scrollNextMock).toHaveBeenCalledTimes(1);

    await userEvent.click(prevButton);
    expect(scrollPrevMock).toHaveBeenCalledTimes(1);
  });

  it("renders pagination dots for each slide and scrolls to target slide on click", async () => {
    render(<Hero />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(HERO_SLIDES.length);

    // First tab active initially
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    // Click second dot
    await userEvent.click(tabs[1]);
    expect(scrollToMock).toHaveBeenCalledWith(1);
  });

  it("handles keyboard navigation with arrow keys", async () => {
    render(<Hero />);

    const carousel = screen.getByRole("region", { name: "Hero featured collections" });

    await userEvent.type(carousel, "{ArrowRight}");
    expect(scrollNextMock).toHaveBeenCalledTimes(1);

    await userEvent.type(carousel, "{ArrowLeft}");
    expect(scrollPrevMock).toHaveBeenCalledTimes(1);
  });
});
