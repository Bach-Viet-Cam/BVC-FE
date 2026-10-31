import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { classesApi } from "@/features/classes/api/classesApi";
import { progressApi } from "@/features/classes/api/progressApi";
import { TeacherHomePage } from "@/features/classes/pages/TeacherHomePage";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { listClasses: vi.fn() } }));
vi.mock("@/features/classes/api/progressApi", () => ({ progressApi: { getProgress: vi.fn() } }));
vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: { listAssignments: vi.fn(), getAssignment: vi.fn() },
}));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const ACTIVE_CLASS = {
  id: "c1",
  name: "TRD301 - Nhạc cụ truyền thống",
  cohort: "FA26",
  status: "ACTIVE",
  instrument: { id: "i1", name: "Đàn tranh" },
  startDate: "2999-01-01",
  endDate: "2999-02-12",
  memberCount: 20,
};

function mockApis({ drafts = 2, published = 4, classes = [ACTIVE_CLASS] } = {}) {
  vi.mocked(classesApi.listClasses).mockResolvedValue({
    data: {
      data: {
        items: classes,
        pagination: { page: 1, limit: 200, total: classes.length },
        activeCount: classes.length,
        cohorts: ["FA26"],
      },
    },
  } as never);
  vi.mocked(progressApi.getProgress).mockResolvedValue({
    data: { data: { summary: { onTrack: 15, atRisk: 3, behind: 2 }, items: PROGRESS_ITEMS } },
  } as never);
  vi.mocked(assignmentsApi.listAssignments).mockImplementation((async (params: { status: string; limit: number }) => ({
    data: {
      data: {
        // The today card lists the published assignments; the stat cards only read the totals.
        items: params.limit > 1 ? PUBLISHED_ASSIGNMENTS : [],
        pagination: { page: 1, limit: params.limit, total: params.status === "DRAFT" ? drafts : published },
      },
    },
  })) as never);
  vi.mocked(assignmentsApi.getAssignment).mockResolvedValue({
    data: {
      data: {
        id: "a1",
        classId: "c1",
        kind: "SOLO",
        students: [
          { studentId: "s1", lastSubmittedAt: new Date().toISOString() },
          { studentId: "s2", lastSubmittedAt: null },
        ],
      },
    },
  } as never);
}

const PROGRESS_ITEMS = [
  {
    userId: "s1",
    username: "Nguyễn An",
    studentCode: "HE001",
    submissionCount: 2,
    averageAccuracy: 62,
    status: "AT_RISK",
  },
  {
    userId: "s2",
    username: "Trần Bình",
    studentCode: "HE002",
    submissionCount: 1,
    averageAccuracy: 40,
    status: "BEHIND",
  },
  {
    userId: "s3",
    username: "Lê Chi",
    studentCode: "HE003",
    submissionCount: 3,
    averageAccuracy: 90,
    status: "ON_TRACK",
  },
  ...Array.from({ length: 5 }, (_, index) => ({
    userId: `r${index}`,
    username: `Sinh viên ${index}`,
    studentCode: null,
    submissionCount: 1,
    averageAccuracy: 70 + index,
    status: "AT_RISK",
  })),
];

const PUBLISHED_ASSIGNMENTS = [{ id: "a1", classId: "c1", kind: "SOLO", status: "PUBLISHED" }];

// The class name also shows in the attention and today cards: read the card of the "Lớp đang dạy" section.
async function findClassCard() {
  const section = (await screen.findByRole("button", { name: "Xem tất cả lớp" })).parentElement
    ?.parentElement as HTMLElement;
  return within(section).getByText("TRD301 - Nhạc cụ truyền thống").closest("button") as HTMLElement;
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <TeacherHomePage />
    </MemoryRouter>
  );

describe("TeacherHomePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the real stats, class card and today's tasks", async () => {
    mockApis();
    renderPage();
    const card = await findClassCard();
    expect(within(card).getByText("Chưa bắt đầu · 20 sinh viên")).toBeInTheDocument();
    expect(
      within(
        screen.getByText("Lớp đang dạy", { selector: "span.text-\\[12\\.5px\\]" }).parentElement as HTMLElement
      ).getByText("1")
    ).toBeInTheDocument();
    expect(screen.getByText("Bài tập đang mở").nextElementSibling).toHaveTextContent("4");
    expect(screen.getByText("5 sinh viên cần chú ý - TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();
    expect(screen.getByText("2 bài tập nháp chưa đăng")).toBeInTheDocument();
    expect(progressApi.getProgress).toHaveBeenCalledWith("c1", expect.anything());
  });

  it("opens the class and the task targets by their real routes", async () => {
    mockApis();
    renderPage();
    await userEvent.click(await findClassCard());
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c1");
    await userEvent.click(screen.getByRole("button", { name: "Xem bài tập" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/assignments");
  });

  it("lists the top students to watch, opens the full list page and a student's history", async () => {
    mockApis();
    renderPage();
    const card = (await screen.findByText("Sinh viên cần chú ý")).closest("section") as HTMLElement;
    const rows = () => within(card).getAllByRole("listitem");
    expect(rows()).toHaveLength(5);
    expect(rows()[0]).toHaveTextContent("Trần Bình");
    expect(rows()[0]).toHaveTextContent("Chậm tiến độ");
    expect(within(card).queryByText("Lê Chi")).not.toBeInTheDocument();

    await userEvent.click(within(card).getByRole("button", { name: "Xem tất cả" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/attention-students");
    expect(rows()).toHaveLength(5);

    await userEvent.click(within(card).getByText("Nguyễn An"));
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c1/students/s1");
  });

  it("shows today's solo / ensemble submitters per class", async () => {
    mockApis();
    renderPage();
    const card = (await screen.findByText("Lượt nộp bài mới")).closest("section") as HTMLElement;
    const row = within(card).getByText("TRD301 - Nhạc cụ truyền thống").closest("li") as HTMLElement;
    expect(within(row).getByText("Độc tấu").nextElementSibling).toHaveTextContent("1/20");
    expect(within(row).getByText("Hòa tấu").nextElementSibling).toHaveTextContent("-");
    expect(assignmentsApi.getAssignment).toHaveBeenCalledWith("a1");
    await userEvent.click(within(card).getByRole("button", { name: "Xem tất cả" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/today-submissions");
  });

  it("shows the empty messages when the lecturer has no running class and no draft", async () => {
    mockApis({ drafts: 0, published: 0, classes: [] });
    renderPage();
    expect(await screen.findByText("Bạn chưa có lớp nào đang dạy.")).toBeInTheDocument();
    expect(screen.getByText("Hôm nay không có việc cần xử lý.")).toBeInTheDocument();
  });

  it("shows the load error with a retry that refetches", async () => {
    mockApis();
    vi.mocked(classesApi.listClasses).mockRejectedValueOnce(new Error("boom"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Tải dữ liệu thất bại");
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await findClassCard()).toBeInTheDocument();
  });
});
