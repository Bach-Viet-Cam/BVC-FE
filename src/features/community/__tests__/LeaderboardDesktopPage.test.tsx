import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leaderboardApi } from "@/features/community/api/leaderboardApi";
import { LeaderboardDesktopPage } from "@/features/community/pages/LeaderboardDesktopPage";
import { type LeaderboardResult, type LeaderboardRow } from "@/features/community/types/leaderboardTypes";

vi.mock("@/features/community/api/leaderboardApi", () => ({ leaderboardApi: { getCurrent: vi.fn() } }));

const isMobile = vi.fn(() => false);
vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => isMobile() }));

const row = (rank: number, name: string, value: number): LeaderboardRow => ({
  rank,
  studentId: `s${rank}`,
  fullName: name,
  className: "Lớp A",
  value,
});

const RESULT: LeaderboardResult = {
  semester: { name: "FA26", label: "Học kỳ Thu 2026" },
  generatedAt: "2026-10-22T01:00:00.000Z",
  totalRanked: 4,
  categoryTotal: 4,
  me: null,
  top3: [row(1, "Phương Linh", 94), row(2, "Minh Anh", 92), row(3, "Hoàng Tùng", 89)],
  items: [row(4, "Gia Hân", 84)],
  pagination: { page: 1, limit: 50, total: 1 },
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <LeaderboardDesktopPage />
    </MemoryRouter>
  );

describe("LeaderboardDesktopPage (lecturer and admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile.mockReturnValue(false);
    vi.mocked(leaderboardApi.getCurrent).mockResolvedValue({ data: { data: RESULT } } as never);
  });

  it("shows the podium and a Hạng / Họ tên / Lớp / Giá trị table, without the personal rank card", async () => {
    renderPage();

    expect(await screen.findByText("Gia Hân")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual(["Hạng", "Họ tên", "Lớp", "Giá trị"]);
    expect(within(screen.getByRole("list", { name: "Top 3" })).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByText("Hạng của bạn")).not.toBeInTheDocument();
    expect(screen.getByText(/Học kỳ Thu 2026 · Cập nhật/)).toBeInTheDocument();
  });

  it("switches tab and asks the API for that category", async () => {
    renderPage();
    await screen.findByText("Gia Hân");

    await userEvent.click(screen.getByRole("tab", { name: "Tích cực nhất" }));

    expect(leaderboardApi.getCurrent).toHaveBeenLastCalledWith(expect.objectContaining({ category: "activity" }));
  });

  it("uses the phone list instead of the table below 768 px", async () => {
    isMobile.mockReturnValue(true);
    renderPage();

    expect(await screen.findByText("Gia Hân")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Danh sách xếp hạng" })).toBeInTheDocument();
  });
});
