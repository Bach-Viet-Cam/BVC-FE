import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { challengeApi } from "@/features/community/api/challengeApi";
import { LecturerChallengesPage } from "@/features/community/pages/LecturerChallengesPage";
import { type Challenge } from "@/features/community/types/challenge";

vi.mock("@/features/community/api/challengeApi", () => ({
  challengeApi: { list: vi.fn(), remove: vi.fn() },
}));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const DRAFT: Challenge = {
  id: "c1",
  title: "Thử thách tuần cuối năm",
  description: null,
  status: "DRAFT",
  displayStatus: "DRAFT",
  instrument: { id: "i1", name: "Đàn tranh" },
  piece: { id: "p1", title: "Lý ngựa ô" },
  classes: [
    { id: "k1", name: "TRD301" },
    { id: "k2", name: "TRD201" },
  ],
  weekStart: "2026-12-28",
  startsAt: "2026-12-27T17:00:00.000Z",
  endsAt: "2027-01-03T16:59:59.999Z",
  minAccuracy: 70,
  requiredBpm: null,
  maxSubmissions: 3,
  publishedAt: null,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};
const PUBLISHED: Challenge = {
  ...DRAFT,
  id: "c2",
  title: "Thử thách đang chạy",
  status: "PUBLISHED",
  displayStatus: "ACTIVE",
  instrument: { id: "i2", name: "Đàn bầu" },
  classes: [{ id: "k3", name: "TRD101" }],
};

function mockList(items: Challenge[]) {
  vi.mocked(challengeApi.list).mockResolvedValue({
    data: { data: { items, pagination: { page: 1, limit: 10, total: items.length } } },
  } as never);
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <LecturerChallengesPage />
    </MemoryRouter>
  );

describe("LecturerChallengesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title, instrument, week, scope and status per row", async () => {
    mockList([DRAFT, PUBLISHED]);
    renderPage();
    const row = (await screen.findByText("Thử thách tuần cuối năm")).closest("li") as HTMLElement;
    expect(within(row).getByText("Đàn tranh")).toBeInTheDocument();
    expect(within(row).getByText("28/12 - 03/01/2027")).toBeInTheDocument();
    expect(within(row).getByText("TRD301, TRD201")).toBeInTheDocument();
    expect(within(row).getByText("Bản nháp")).toBeInTheDocument();
    const active = screen.getByText("Thử thách đang chạy").closest("li") as HTMLElement;
    expect(within(active).getByText("Đang diễn ra")).toBeInTheDocument();
  });

  it("shows the MSG-06 empty state", async () => {
    mockList([]);
    renderPage();
    expect(await screen.findByText("Bạn chưa có thử thách.")).toBeInTheDocument();
  });

  it("navigates to the form from Tạo thử thách", async () => {
    mockList([]);
    renderPage();
    await screen.findByText("Bạn chưa có thử thách.");
    await userEvent.click(screen.getByRole("button", { name: "Tạo thử thách" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/challenges/new");
  });

  it("offers Sửa and Xóa on drafts only", async () => {
    mockList([DRAFT, PUBLISHED]);
    renderPage();
    const draftRow = (await screen.findByText("Thử thách tuần cuối năm")).closest("li") as HTMLElement;
    const publishedRow = screen.getByText("Thử thách đang chạy").closest("li") as HTMLElement;
    expect(within(draftRow).getByRole("button", { name: "Sửa" })).toBeInTheDocument();
    expect(within(draftRow).getByRole("button", { name: "Xóa" })).toBeInTheDocument();
    expect(within(publishedRow).queryByRole("button", { name: "Sửa" })).not.toBeInTheDocument();
    expect(within(publishedRow).queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
    await userEvent.click(within(draftRow).getByRole("button", { name: "Sửa" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/challenges/c1/edit");
  });

  it("asks for confirmation before deleting", async () => {
    mockList([DRAFT]);
    vi.mocked(challengeApi.remove).mockResolvedValue({ data: { message: "Đã xóa thử thách." } } as never);
    renderPage();
    const row = (await screen.findByText("Thử thách tuần cuối năm")).closest("li") as HTMLElement;
    await userEvent.click(within(row).getByRole("button", { name: "Xóa" }));
    expect(challengeApi.remove).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Xóa" }));
    await waitFor(() => expect(challengeApi.remove).toHaveBeenCalledWith("c1"));
  });
});
