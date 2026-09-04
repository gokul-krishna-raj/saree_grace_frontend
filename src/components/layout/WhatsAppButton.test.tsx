import { render, screen } from "@testing-library/react";

import { WhatsAppButton } from "./WhatsAppButton";

describe("WhatsAppButton component", () => {
  it("renders a link with accessible aria-label", () => {
    render(<WhatsAppButton />);
    const link = screen.getByRole("link", { name: /chat with us on whatsapp/i });
    expect(link).toBeInTheDocument();
  });

  it("opens WhatsApp in a new tab with noopener noreferrer", () => {
    render(<WhatsAppButton />);
    const link = screen.getByRole("link", { name: /chat with us on whatsapp/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("contains the pre-filled enquiry message in href", () => {
    render(<WhatsAppButton phoneNumber="919385629808" />);
    const link = screen.getByRole("link", { name: /chat with us on whatsapp/i });
    const href = link.getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/919385629808\?text=/);
    expect(href).toContain(
      encodeURIComponent("Hi Saree Grace, I would like to know more about your sarees."),
    );
  });

  it("applies responsive positioning and z-index classes to clear mobile bottom nav", () => {
    const { container } = render(<WhatsAppButton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("fixed");
    expect(wrapper).toHaveClass("z-40");
    expect(wrapper).toHaveClass("right-4");
    expect(wrapper).toHaveClass("bottom-20");
    expect(wrapper).toHaveClass("lg:bottom-6");
    expect(wrapper).toHaveClass("lg:right-6");
  });

  it("allows custom className and props override", () => {
    const { container } = render(
      <WhatsAppButton
        phoneNumber="9876543210"
        message="Custom message"
        className="custom-test-class"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-test-class");
    const link = screen.getByRole("link", { name: /chat with us on whatsapp/i });
    expect(link.getAttribute("href")).toBe("https://wa.me/919876543210?text=Custom%20message");
  });
});
