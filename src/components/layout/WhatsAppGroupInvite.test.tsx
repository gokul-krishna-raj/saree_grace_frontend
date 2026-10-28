import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let pathnameMock = "/";
jest.mock("next/navigation", () => ({ usePathname: () => pathnameMock }));

const trackJoinMock = jest.fn();
jest.mock("@/lib/analytics", () => ({
  trackJoinWhatsAppGroup: (...args: unknown[]) => trackJoinMock(...args),
}));

import { JoinWhatsAppGroupLink, WhatsAppGroupInvite } from "./WhatsAppGroupInvite";

const GROUP_URL = "https://chat.whatsapp.com/B9mkNEsqoTKD16MZTZspJ1";
const STORAGE_KEY = "sg_whatsapp_group_invite";

function renderAndWait() {
  render(<WhatsAppGroupInvite />);
  act(() => {
    jest.advanceTimersByTime(8000);
  });
}

describe("WhatsAppGroupInvite", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
    pathnameMock = "/";
    trackJoinMock.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it("invites a new visitor after a short delay, linking to the group", () => {
    render(<WhatsAppGroupInvite />);
    expect(screen.queryByText("Join our WhatsApp group")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(8000);
    });
    expect(screen.getByText("Join our WhatsApp group")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the group" })).toHaveAttribute("href", GROUP_URL);
  });

  it.each(["/checkout", "/cart", "/account/orders", "/admin/products", "/login"])(
    "never shows on %s",
    (path) => {
      pathnameMock = path;
      renderAndWait();
      expect(screen.queryByText("Join our WhatsApp group")).not.toBeInTheDocument();
    },
  );

  it("stays hidden after 'Not now' until the snooze period passes", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderAndWait();
    await user.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByText("Join our WhatsApp group")).not.toBeInTheDocument();

    const { dismissedAt } = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(typeof dismissedAt).toBe("number");
  });

  it("does not invite a visitor who dismissed it recently", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    renderAndWait();
    expect(screen.queryByText("Join our WhatsApp group")).not.toBeInTheDocument();
  });

  it("invites again once the snooze period has passed", () => {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: fifteenDaysAgo }));
    renderAndWait();
    expect(screen.getByText("Join our WhatsApp group")).toBeInTheDocument();
  });

  it("never invites again after joining, and tracks the click", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderAndWait();
    await user.click(screen.getByRole("link", { name: "Join the group" }));

    expect(trackJoinMock).toHaveBeenCalledWith("popup");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual({ joined: true });
    expect(screen.queryByText("Join our WhatsApp group")).not.toBeInTheDocument();
  });

  it("still renders when storage is unavailable", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    renderAndWait();
    expect(screen.getByText("Join our WhatsApp group")).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});

describe("JoinWhatsAppGroupLink", () => {
  beforeEach(() => {
    window.localStorage.clear();
    trackJoinMock.mockReset();
  });

  it("links to the group, tracks the click and suppresses the popup", async () => {
    render(<JoinWhatsAppGroupLink location="footer">Join us</JoinWhatsAppGroupLink>);
    const link = screen.getByRole("link", { name: "Join us" });
    expect(link).toHaveAttribute("href", GROUP_URL);
    expect(link).toHaveAttribute("target", "_blank");

    await userEvent.click(link);
    expect(trackJoinMock).toHaveBeenCalledWith("footer");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual({ joined: true });
  });
});
