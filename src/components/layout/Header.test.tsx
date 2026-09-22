import { render, screen } from "@testing-library/react";

import { Header } from "./Header";

// Mock redux hooks and uiSlice
jest.mock("@/store/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { status: "unauthenticated" },
      ui: { mobileMenuOpen: false },
    }),
}));

jest.mock("@/hooks/useCartCount", () => ({
  useCartCount: () => 2,
}));

jest.mock("@/hooks/useWishlistCount", () => ({
  useWishlistCount: () => 1,
}));

jest.mock("./MobileMenu", () => ({
  MobileMenu: () => <div data-testid="mobile-menu" />,
}));

jest.mock("./SearchOverlay", () => ({
  SearchOverlay: () => <div data-testid="search-overlay" />,
}));

describe("Header Component", () => {
  it("renders the Saree Grace brand link", () => {
    render(<Header />);

    const brandLink = screen.getByRole("link", { name: "Saree Grace" });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders desktop navigation links", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute("href", "/categories");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("displays cart and wishlist count badges", () => {
    render(<Header />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
