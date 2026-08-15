import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const addProductVariantMock = jest.fn();
jest.mock("@/store/api/productsApi", () => ({
  useAddProductVariantMutation: () => [addProductVariantMock, { isLoading: false }],
}));

import { VariantMiniForm } from "./VariantMiniForm";

describe("VariantMiniForm", () => {
  beforeEach(() => {
    addProductVariantMock.mockReset();
    addProductVariantMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  async function fillCommonFields() {
    await userEvent.type(screen.getByLabelText("SKU"), "SKU-1");
    await userEvent.type(screen.getByLabelText("Price (₹)"), "1000");
    await userEvent.type(screen.getByLabelText("Stock"), "5");
  }

  it("renders a color swatch picker for a colorCode attribute alongside a plain input for color", () => {
    render(
      <VariantMiniForm
        productId="p1"
        attributeNames={["color", "colorCode"]}
        onAdded={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Color")).toBeInTheDocument();
    expect(screen.getByText("Color code")).toBeInTheDocument();
    expect(screen.getByLabelText("Pick color")).toHaveAttribute("type", "color");
  });

  it("blocks submission with an inline error when colorCode is not a valid hex value", async () => {
    render(
      <VariantMiniForm
        productId="p1"
        attributeNames={["color", "colorCode"]}
        onAdded={jest.fn()}
      />,
    );

    await userEvent.type(screen.getByLabelText("Color"), "Maroon");
    await userEvent.type(screen.getByPlaceholderText("#800000"), "not-a-hex");
    await fillCommonFields();
    await userEvent.click(screen.getByRole("button", { name: "Add variant" }));

    expect(await screen.findByText(/valid hex color/i)).toBeInTheDocument();
    expect(addProductVariantMock).not.toHaveBeenCalled();
  });

  it("submits with the colorCode attribute once it's a valid hex value", async () => {
    const onAdded = jest.fn();
    render(
      <VariantMiniForm productId="p1" attributeNames={["color", "colorCode"]} onAdded={onAdded} />,
    );

    await userEvent.type(screen.getByLabelText("Color"), "Maroon");
    await userEvent.type(screen.getByPlaceholderText("#800000"), "#800000");
    await fillCommonFields();
    await userEvent.click(screen.getByRole("button", { name: "Add variant" }));

    expect(addProductVariantMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "p1",
        variant: expect.objectContaining({
          attributes: { color: "Maroon", colorCode: "#800000" },
        }),
      }),
    );
  });

  it("still requires every attribute to be filled in, same as before colorCode support", async () => {
    render(
      <VariantMiniForm productId="p1" attributeNames={["color", "size"]} onAdded={jest.fn()} />,
    );

    await fillCommonFields();
    await userEvent.click(screen.getByRole("button", { name: "Add variant" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Fill in: color, size");
    expect(addProductVariantMock).not.toHaveBeenCalled();
  });
});
