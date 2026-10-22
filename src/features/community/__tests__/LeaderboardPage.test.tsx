import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leaderboardApi } from "@/features/community/api/leaderboardApi";
import { LeaderboardPage } from "@/features/community/pages/LeaderboardPage";
import { type LeaderboardResult, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";

vi.mock("@/features/community/api/leaderboardApi", () => ({ leaderboardApi: { getCurrent: vi.fn() } }));

const auth = vi.hoisted(() => ({ user: { userId: "me", username: "Tuấn Anh", email: "a@fpt.edu.vn", role: 1 } }));
const isMobile = vi.fn(() => true);
vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => isMobile() }));
vi.mock("@/shared/components/bvc/StudentShell", () => ({
  StudentShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/shared/context/AuthContext", () => ({ useAuth: () => ({ user: auth.user }) }));

const row = (rank: number, name: string, value: number, studentId = `s${rank}`): LeaderboardRow => ({
  rank,
  studentId,
  fullName: name,
  className: "Lớp A",
  value,
});

function result(overrides: Partial<LeaderboardResult> = {}): LeaderboardResult {
  return {
    semester: { name: "FA26", label: "Học kỳ Thu 2026" },
    generatedAt: "2026-10-22T01:00:00.000Z",
    totalRanked: 5,
    categoryTotal: 5,
    me: { status: "RANKED", rank: 5, value: 61.5 },
    top3: [row(1, "Phương Linh", 94), row(2, "Minh Anh", 92), row(3, "Hoàng Tùng", 89)],
    items: [row(4, "Gia Hân", 84), row(5, "Tuấn Anh", 61.5, "me")],
    pagination: { page: 1, limit: 50, total: 2 },
    ...overrides,
  };
}

function mockResult(data: LeaderboardResult) {
  vi.mocked(leaderboardApi.getCurrent).mockResolvedValue({ data: { data } } as never);
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <LeaderboardPage />
    </MemoryRouter>
  );

describe("LeaderboardPage (student)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile.mockReturnValue(true);
    auth.user = { userId: "me", username: "Tuấn Anh", email: "a@fpt.edu.vn", role: 1 };
  });

  it("opens on the overall tab with the semester, update time and the viewer's rank", async () => {
    mockResult(result());
    renderPage();

    expect(await screen.findByText(/Học kỳ Thu 2026 · Cập nhật \d{2}:\d{2} 22\/10\/2026/)).toBeInTheDocument();
    expect(leaderboardApi.getCurrent).toHaveBeenCalledWith(expect.objectContaining({ category: "overall", page: 1 }));
    expect(screen.getByRole("tab", { name: "Xếp hạng tổng" })).toHaveAttribute("aria-selected", "true");
    const card = screen.getByRole("region", { name: "Hạng của bạn" });
    expect(card).toHaveTextContent("5 / 5");
    expect(within(card).getByText("61.5")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Top 3" })).getAllByRole("listitem")).toHaveLength(3);
  });

  it("asks the API for the new category when a tab is clicked", async () => {
    mockResult(result());
    renderPage();
    await screen.findByText("Phương Linh");

    await userEvent.click(screen.getByRole("tab", { name: "Chuỗi luyện tập" }));

    expect(leaderboardApi.getCurrent).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: "streak", page: 1 })
    );
    expect(screen.getAllByRole("tab")).toHaveLength(5);
  });

  it("formats values by tab: %, +x.x%, ngày, buổi", async () => {
    mockResult(
      result({ me: null, top3: [row(1, "Phương Linh", 94)], items: [], pagination: { page: 1, limit: 50, total: 0 } })
    );
    renderPage();
    await screen.findByText("Phương Linh");
    await userEvent.click(screen.getByRole("tab", { name: "Chính xác nhất" }));
    expect(await screen.findByText("94%")).toBeInTheDocument();

    mockResult(
      result({ me: null, top3: [row(1, "Phương Linh", 3.5)], items: [], pagination: { page: 1, limit: 50, total: 0 } })
    );
    await userEvent.click(screen.getByRole("tab", { name: "Tiến bộ nhất" }));
    expect(await screen.findByText("+3.5%")).toBeInTheDocument();

    mockResult(
      result({ me: null, top3: [row(1, "Phương Linh", 7)], items: [], pagination: { page: 1, limit: 50, total: 0 } })
    );
    await userEvent.click(screen.getByRole("tab", { name: "Chuỗi luyện tập" }));
    expect(await screen.findByText("7 ngày")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Tích cực nhất" }));
    expect(await screen.findByText("7 buổi")).toBeInTheDocument();
  });

  it("highlights the viewer's own row", async () => {
    mockResult(result());
    renderPage();
    const list = await screen.findByRole("list", { name: "Danh sách xếp hạng" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows[1]).toHaveAttribute("aria-current", "true");
    expect(rows[1]).toHaveClass("bg-bvc-accent-tint");
    expect(rows[0]).not.toHaveAttribute("aria-current");
  });

  it("on a wide screen shows the web table with the viewer row tinted, not the PWA frame", async () => {
    isMobile.mockReturnValue(false);
    mockResult(result());
    renderPage();

    const table = await screen.findByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual(["Hạng", "Họ tên", "Lớp", "Giá trị"]);
    const viewerRow = within(table).getByText("Tuấn Anh").closest("tr");
    expect(viewerRow).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("heading", { name: "Bảng xếp hạng", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Hạng của bạn" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Danh sách xếp hạng" })).not.toBeInTheDocument();
  });

  describe("empty states", () => {
    it("MSG-49 when the semester has no ranking yet", async () => {
      mockResult(
        result({
          generatedAt: null,
          totalRanked: 0,
          categoryTotal: 0,
          me: null,
          top3: [],
          items: [],
          pagination: { page: 1, limit: 50, total: 0 },
        })
      );
      renderPage();
      expect(await screen.findByText("Học kỳ này chưa có dữ liệu xếp hạng.")).toBeInTheDocument();
    });

    it("MSG-50 when the viewer has no activity, the list stays visible", async () => {
      mockResult(result({ me: { status: "NO_ACTIVITY" } }));
      renderPage();
      expect(
        await screen.findByText("Bạn chưa có hoạt động nào trong học kỳ này nên chưa được xếp hạng.")
      ).toBeInTheDocument();
      expect(screen.getByText("Phương Linh")).toBeInTheDocument();
    });

    it("MSG-51 when the viewer or the whole tab has no data", async () => {
      mockResult(result({ me: { status: "NOT_IN_CATEGORY", reason: "NO_DATA" } }));
      renderPage();
      expect(await screen.findByText("Hạng mục này chưa có dữ liệu.")).toBeInTheDocument();

      mockResult(
        result({
          categoryTotal: 0,
          me: { status: "NOT_IN_CATEGORY", reason: "NO_DATA" },
          top3: [],
          items: [],
          pagination: { page: 1, limit: 50, total: 0 },
        })
      );
      await userEvent.click(screen.getByRole("tab", { name: "Chuỗi luyện tập" }));
      expect(await screen.findAllByText("Hạng mục này chưa có dữ liệu.")).toHaveLength(2);
    });

    it("MSG-52 when there is no previous week to compare", async () => {
      mockResult(
        result({
          me: { status: "NOT_IN_CATEGORY", reason: "NO_PREVIOUS_WEEK" },
          categoryTotal: 0,
          top3: [],
          items: [],
          pagination: { page: 1, limit: 50, total: 0 },
        })
      );
      renderPage();
      await userEvent.click(await screen.findByRole("tab", { name: "Tiến bộ nhất" }));
      expect(await screen.findAllByText("Chưa có dữ liệu tuần trước để so sánh tiến bộ.")).toHaveLength(2);
    });
  });

  it("shows the load error with a retry button", async () => {
    vi.mocked(leaderboardApi.getCurrent).mockRejectedValueOnce(new Error("boom"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Tải bảng xếp hạng thất bại. Vui lòng thử lại.");

    mockResult(result());
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Phương Linh")).toBeInTheDocument();
  });

  it("Xem thêm appends the next page below the first", async () => {
    mockResult(result({ items: [row(4, "Gia Hân", 84)], pagination: { page: 1, limit: 50, total: 2 } }));
    renderPage();
    await screen.findByText("Gia Hân");

    mockResult(result({ items: [row(5, "Quốc Bảo", 70)], pagination: { page: 2, limit: 50, total: 2 } }));
    await userEvent.click(screen.getByRole("button", { name: "Xem thêm" }));

    expect(await screen.findByText("Quốc Bảo")).toBeInTheDocument();
    expect(screen.getByText("Gia Hân")).toBeInTheDocument();
    expect(leaderboardApi.getCurrent).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(screen.queryByRole("button", { name: "Xem thêm" })).not.toBeInTheDocument();
  });

  it("has no Xem thêm button when everything fits on the first page", async () => {
    mockResult(result());
    renderPage();
    await screen.findByText("Gia Hân");
    expect(screen.queryByRole("button", { name: "Xem thêm" })).not.toBeInTheDocument();
  });
});
