import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";
import { NotificationBell } from "@/shared/components/bvc/NotificationBell";

vi.mock("@/features/platform/api/myNotificationApi", () => ({
  myNotificationApi: { countUnread: vi.fn() },
}));

function renderBell() {
  render(
    <MemoryRouter>
      <NotificationBell className="" iconClassName="" />
    </MemoryRouter>
  );
}

describe("NotificationBell", () => {
  it("shows the unread count and links to the inbox", async () => {
    vi.mocked(myNotificationApi.countUnread).mockResolvedValue({ data: { data: { count: 3 } } } as never);
    renderBell();
    const link = await screen.findByRole("link", { name: "Thông báo, 3 chưa đọc" });
    expect(link).toHaveAttribute("href", "/notifications");
    expect(link).toHaveTextContent("3");
  });

  it("caps the badge at 99+", async () => {
    vi.mocked(myNotificationApi.countUnread).mockResolvedValue({ data: { data: { count: 120 } } } as never);
    renderBell();
    expect(await screen.findByText("99+")).toBeInTheDocument();
  });

  it("stays a plain bell when the count cannot load", async () => {
    vi.mocked(myNotificationApi.countUnread).mockRejectedValue(new Error("offline"));
    renderBell();
    expect(await screen.findByRole("link", { name: "Thông báo" })).toBeInTheDocument();
  });
});
