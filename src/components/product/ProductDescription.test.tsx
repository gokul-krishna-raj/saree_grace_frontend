import { render, screen } from "@testing-library/react";

import { ProductDescription } from "./ProductDescription";

describe("ProductDescription", () => {
  it("renders nothing when the description is empty, null, or whitespace-only", () => {
    const { container: empty } = render(<ProductDescription description="" />);
    expect(empty).toBeEmptyDOMElement();

    const { container: nullDesc } = render(<ProductDescription description={null} />);
    expect(nullDesc).toBeEmptyDOMElement();

    const { container: whitespace } = render(<ProductDescription description={"   \n\n  "} />);
    expect(whitespace).toBeEmptyDOMElement();
  });

  it("renders the Description heading and preserves multiple paragraphs", () => {
    render(
      <ProductDescription description={"First paragraph.\n\nSecond paragraph with more detail."} />,
    );

    expect(screen.getByRole("heading", { name: "Description" })).toBeInTheDocument();
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph with more detail.")).toBeInTheDocument();
  });

  it("preserves single line breaks within a paragraph", () => {
    const { container } = render(<ProductDescription description={"Line one\nLine two"} />);
    expect(container.querySelector("br")).toBeInTheDocument();
    expect(container.textContent).toContain("Line one");
    expect(container.textContent).toContain("Line two");
  });

  it("renders a bulleted block as a list", () => {
    render(
      <ProductDescription
        description={"Perfect for:\n\n• Weddings\n• Festivals\n• Traditional occasions"}
      />,
    );

    const list = screen.getByRole("list");
    const items = screen.getAllByRole("listitem");
    expect(list).toBeInTheDocument();
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Weddings");
  });

  it("renders HTML descriptions as formatted content instead of raw tags", () => {
    const html = "<p>Elegant saree.</p><ul><li>Weddings</li><li>Festivals</li></ul>";
    const { container } = render(<ProductDescription description={html} />);

    expect(container.querySelector("p")).toHaveTextContent("Elegant saree.");
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.textContent).not.toContain("<p>");
  });

  it("strips unsafe tags and attributes from HTML descriptions", () => {
    const html = '<p>Safe text</p><script>alert("xss")</script><img src=x onerror="alert(1)">';
    const { container } = render(<ProductDescription description={html} />);

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.textContent).toContain("Safe text");
  });
});
