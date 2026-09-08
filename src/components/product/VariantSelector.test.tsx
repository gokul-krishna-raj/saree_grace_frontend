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

  it("renders color swatches for 'Colour' (British spelling) attribute", () => {
    const colourVariants: ProductVariant[] = [
      {
        _id: "v1",
        sku: "SKU-MAROON",
        attributes: { colour: "Maroon", colorCode: "#800000" },
        price: 2000,
        stock: 4,
        images: [],
        isActive: true,
      },
    ];
    render(
      <VariantSelector
        attributeNames={["colour"]}
        variants={colourVariants}
        selection={{ colour: "Maroon" }}
        onSelect={jest.fn()}
      />,
    );

    const maroonButton = screen.getByRole("button", { name: /maroon/i });
    const swatch = maroonButton.querySelector("span[aria-hidden='true']");
    expect(swatch).toHaveStyle({ backgroundColor: "#800000" });
  });

  it("renders options and swatches when attributeNames casing differs from variant attributes", () => {
    render(
      <VariantSelector
        attributeNames={["Color"]}
        variants={variants}
        selection={{ Color: "Red" }}
        onSelect={jest.fn()}
      />,
    );

    const redButton = screen.getByRole("button", { name: /red/i });
    expect(redButton).toHaveAttribute("aria-pressed", "true");
    const swatch = redButton.querySelector("span[aria-hidden='true']");
    expect(swatch).toHaveStyle({ backgroundColor: "#ff0000" });

    const blueButton = screen.getByRole("button", { name: /blue/i });
    expect(blueButton).toHaveAttribute("aria-pressed", "false");
  });

  it("renders all 6 color variants when a product has 6 colors across variants with secondary attributes", async () => {
    const onSelect = jest.fn();
    const sixColorVariants: ProductVariant[] = [
      {
        _id: "v1",
        sku: "SG-KP-SK-1011",
        attributes: { color: "Cream", colorCode: "#bba995", border: "Blue" },
        price: 1500,
        stock: 10,
        images: [],
        isActive: true,
      },
      {
        _id: "v2",
        sku: "SS-KP-PK-1012",
        attributes: { color: "pink", colorCode: "#e67382", border: "Blue" },
        price: 1500,
        stock: 10,
        images: [],
        isActive: true,
      },
      {
        _id: "v3",
        sku: "SS-KP-SL-1013",
        attributes: { color: "Mustard yellow", colorCode: "#ad622b", border: "Maroon" },
        price: 1500,
        stock: 10,
        images: [],
        isActive: true,
      },
      {
        _id: "v4",
        sku: "SS-KP-RE-1014",
        attributes: { color: "Ruby pink", colorCode: "#b0214d", border: "Green" },
        price: 1500,
        stock: 10,
        images: [],
        isActive: true,
      },
      {
        _id: "v5",
        sku: "SS-KP-BLE-1015",
        attributes: { color: "Blue", colorCode: "#6e9897", border: "Ink blue" },
        price: 1500,
        stock: 10,
        images: [],
        isActive: true,
      },
      {
        _id: "v6",
        sku: "SS-KP-YLL-1016",
        attributes: { color: "Yellow", colorCode: "#e6cf5d", border: "Blue" },
        price: 1500,
        stock: 10,
        images: [],
        isActive: true,
      },
    ];

    render(
      <VariantSelector
        attributeNames={["color", "border"]}
        variants={sixColorVariants}
        selection={{ color: "Cream", border: "Blue" }}
        onSelect={onSelect}
      />,
    );

    // All 6 colors must be present in the document
    expect(screen.getByRole("button", { name: /^cream$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pink$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^mustard yellow$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^ruby pink$/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^blue$/i })).toHaveLength(2); // In color and border rows
    expect(screen.getByRole("button", { name: /^yellow$/i })).toBeInTheDocument();

    // Clicking Ruby pink (which was previously hidden due to border: Blue) must call onSelect
    await userEvent.click(screen.getByRole("button", { name: /^ruby pink$/i }));
    expect(onSelect).toHaveBeenCalledWith("color", "Ruby pink");
  });
});
