import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";
import { NotificationsPage } from "@/features/platform/pages/NotificationsPage";
import { type MyNotificationItem } from "@/features/platform/types/myNotificationTypes";

vi.mock("@/features/platform/api/myNotificationApi", () => ({
  myNotificationApi: { list: vi.fn(), countUnread: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const item = (id: string, overrides: Partial<MyNotificationItem> = {}): MyNotificationItem => ({
  id,
  title: `Thông báo ${id}`,
  body: "Nội dung",
  type: "ANNOUNCEMENT",
  link: null,
  isRead: false,
  sentAt: new Date().toISOString(),
  ...overrides,
});

const page = (items: MyNotificationItem[], total = items.length) =>
  ({
    data: { data: { items, total, page: 1, pageSize: 20, unreadCount: items.filter((entry) => !entry.isRead).length } },
  }) as never;

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/notifications"]}>
      <Routes>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/assignment/:id" element={<p>Trang bài tập</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.mocked(myNotificationApi.list).mockReset();
    vi.mocked(myNotificationApi.markRead).mockResolvedValue({} as never);
  });

  it("groups today and earlier, opening one marks it read and follows its link", async () => {
    vi.mocked(myNotificationApi.list).mockResolvedValue(
      page([
        item("a", { title: "Giảng viên đã nhận xét bài nộp", link: "/assignment/a1" }),
        item("b", { title: "Bảo trì hoàn tất", type: "SYSTEM", isRead: true, sentAt: "2026-01-02T03:00:00.000Z" }),
      ])
    );
    renderPage();
    expect(await screen.findByText("Hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Trước đó")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Chưa đọc")).toHaveLength(1);

    await userEvent.click(screen.getByText("Giảng viên đã nhận xét bài nộp"));
    expect(myNotificationApi.markRead).toHaveBeenCalledWith("a");
    expect(await screen.findByText("Trang bài tập")).toBeInTheDocument();
  });

  it("sends the filter to the API and loads more pages", async () => {
    vi.mocked(myNotificationApi.list)
      .mockResolvedValueOnce(page([item("a")], 2))
      .mockResolvedValueOnce(page([item("b")], 2))
      .mockResolvedValueOnce(page([]));
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "Xem thêm" }));
    expect(await screen.findByText("Thông báo b")).toBeInTheDocument();
    expect(myNotificationApi.list).toHaveBeenLastCalledWith({ page: 2, pageSize: 20 });
    expect(screen.queryByRole("button", { name: "Xem thêm" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Hệ thống" }));
    expect(await screen.findByText("Không có thông báo")).toBeInTheDocument();
    expect(myNotificationApi.list).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, type: "SYSTEM" });
  });

  it("marks everything read", async () => {
    vi.mocked(myNotificationApi.list).mockResolvedValue(page([item("a"), item("b")]));
    vi.mocked(myNotificationApi.markAllRead).mockResolvedValue({
      data: { data: { updated: 2 }, message: "Đã đánh dấu tất cả thông báo là đã đọc." },
    } as never);
    renderPage();
    await screen.findByText("Thông báo a");
    await userEvent.click(screen.getByRole("button", { name: "Đọc tất cả" }));
    expect(screen.queryAllByLabelText("Chưa đọc")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Đọc tất cả" })).toBeDisabled();
  });
});
