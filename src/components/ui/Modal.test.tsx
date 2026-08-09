import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Filters">
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders content and calls onClose on Escape and the close button", async () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="Filters">
        <p>Content</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
