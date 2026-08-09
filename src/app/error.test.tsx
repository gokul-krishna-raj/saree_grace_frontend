import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ErrorBoundaryFallback from "./error";

describe("root error boundary", () => {
  it("logs the error and lets the user retry", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const retry = jest.fn();
    const error = Object.assign(new Error("boom"), { digest: "abc123" });

    render(<ErrorBoundaryFallback error={error} retry={retry} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
