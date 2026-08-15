import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ProductVariant } from "@/types";

import { VariantSelector } from "./VariantSelector";

const variants: ProductVariant[] = [
  {
    _id: "v1",
    sku: "SKU-RED",
    attributes: { color: "Red", colorCode: "#ff0000" },
    price: 1000,
    stock: 5,
    images: [],
    isActive: true,
  },
  {
    _id: "v2",
    sku: "SKU-BLUE",
    attributes: { color: "Blue", colorCode: "#0000ff" },
    price: 1200,
    stock: 2,
    images: [],
    isActive: true,
  },
];

describe("VariantSelector", () => {
  it("renders a color swatch sourced from each variant's colorCode attribute", () => {
    render(
      <VariantSelector
        attributeNames={["color"]}
        variants={variants}
        selection={{ color: "Red" }}
        onSelect={jest.fn()}
      />,
    );

    const redButton = screen.getByRole("button", { name: /red/i });
    const swatch = redButton.querySelector("span[aria-hidden='true']");
    expect(swatch).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("does not render a swatch for a non-color attribute row", () => {
    const sizeVariants: ProductVariant[] = variants.map((v) => ({
      ...v,
      attributes: { size: v.attributes.color === "Red" ? "S" : "M" },
    }));
    render(
      <VariantSelector
        attributeNames={["size"]}
        variants={sizeVariants}
        selection={{ size: "S" }}
        onSelect={jest.fn()}
      />,
    );

    const sizeButton = screen.getByRole("button", { name: /^s$/i });
    expect(sizeButton.querySelector("span[aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("calls onSelect with the attribute name and clicked value", async () => {
    const onSelect = jest.fn();
    render(
      <VariantSelector
        attributeNames={["color"]}
        variants={variants}
        selection={{ color: "Red" }}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /blue/i }));
    expect(onSelect).toHaveBeenCalledWith("color", "Blue");
  });
});
