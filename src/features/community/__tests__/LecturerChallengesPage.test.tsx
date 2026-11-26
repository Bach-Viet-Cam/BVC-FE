import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { challengeApi } from "@/features/community/api/challengeApi";
import { LecturerChallengesPage } from "@/features/community/pages/LecturerChallengesPage";
import { type Challenge, type ChallengeDetail } from "@/features/community/types/challenge";

vi.mock("@/features/community/api/challengeApi", () => ({
  challengeApi: { list: vi.fn(), remove: vi.fn(), getDetail: vi.fn(), formMeta: vi.fn(() => new Promise(() => {})) },
}));
vi.mock("@/features/classes/hooks/useLecturerClasses", () => ({
  useLecturerClasses: () => ({ classes: [], isLoading: false }),
}));
vi.mock("@/features/classes/hooks/useInstruments", () => ({
  useInstruments: () => ({ instruments: [], isLoading: false, error: null }),
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

const renderDrawer = (challengeId: string) =>
  render(
    <MemoryRouter initialEntries={[`/teacher/challenges/${challengeId}`]}>
      <Routes>
        <Route path="/teacher/challenges/:challengeId" element={<LecturerChallengesPage />} />
      </Routes>
    </MemoryRouter>
  );

function detailOf(challenge: Challenge): ChallengeDetail {
  return {
    ...challenge,
    effectiveMinAccuracy: 70,
    students: [
      {
        studentId: "s1",
        fullName: "Nguyễn Văn An",
        studentCode: "SV001",
        classId: "k3",
        className: "TRD101",
        status: "PASSED",
        submissionCount: 2,
        lastSubmittedAt: "2026-11-25T03:00:00.000Z",
        bestAccuracy: 88,
      },
    ],
    practiceStats: {
      totalPractices: 2,
      practicedStudents: 1,
      memberCount: 4,
      averagePerStudent: 2,
      last7Days: [{ date: "2026-11-25", count: 2 }],
    },
    byClass: [{ classId: "k3", className: "TRD101", practicedStudents: 1, memberCount: 4 }],
    media: null,
  };
}

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

  it("opens the create form in a modal from Tạo thử thách", async () => {
    mockList([]);
    renderPage();
    await screen.findByText("Bạn chưa có thử thách.");
    await userEvent.click(screen.getByRole("button", { name: "Tạo thử thách" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Tạo thử thách" })).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
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

  it("links each row to its detail drawer", async () => {
    mockList([DRAFT]);
    renderPage();
    const title = await screen.findByText("Thử thách tuần cuối năm");
    expect(title.closest("a")).toHaveAttribute("href", "/teacher/challenges/c1");
  });

  it("opens the detail drawer from the URL with stats and students", async () => {
    mockList([PUBLISHED]);
    vi.mocked(challengeApi.getDetail).mockResolvedValue({ data: { data: detailOf(PUBLISHED) } } as never);
    renderDrawer("c2");
    const drawer = await screen.findByRole("dialog");
    expect(await within(drawer).findByText("Chi tiết thử thách")).toBeInTheDocument();
    expect(challengeApi.getDetail).toHaveBeenCalledWith("c2");
    expect(within(drawer).getByText("1 / 4")).toBeInTheDocument();
    const student = within(drawer).getByText("Nguyễn Văn An").closest("a");
    expect(student).toHaveAttribute("href", "/teacher/challenges/c2/students/s1");
    expect(within(drawer).getByText("Đạt")).toBeInTheDocument();
    expect(within(drawer).queryByRole("link", { name: "Sửa" })).not.toBeInTheDocument();
    expect(within(drawer).queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });

  it("offers Sửa and Xóa in the drawer of a draft", async () => {
    mockList([DRAFT]);
    vi.mocked(challengeApi.getDetail).mockResolvedValue({ data: { data: detailOf(DRAFT) } } as never);
    renderDrawer("c1");
    const drawer = await screen.findByRole("dialog");
    const edit = await within(drawer).findByRole("link", { name: "Sửa" });
    expect(edit).toHaveAttribute("href", "/teacher/challenges/c1/edit");
    expect(within(drawer).getByRole("button", { name: "Xóa" })).toBeInTheDocument();
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
