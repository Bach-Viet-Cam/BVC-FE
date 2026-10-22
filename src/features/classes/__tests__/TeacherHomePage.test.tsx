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
vi.mock("@/features/classes/api/assignmentsApi", () => ({ assignmentsApi: { listAssignments: vi.fn() } }));

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
    data: { data: { summary: { onTrack: 15, atRisk: 3, behind: 2 }, items: [] } },
  } as never);
  vi.mocked(assignmentsApi.listAssignments).mockImplementation((async (params: { status: string }) => ({
    data: {
      data: { items: [], pagination: { page: 1, limit: 1, total: params.status === "DRAFT" ? drafts : published } },
    },
  })) as never);
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
    const card = (await screen.findByText("TRD301 - Nhạc cụ truyền thống")).closest("button") as HTMLElement;
    expect(within(card).getByText("Chưa bắt đầu · 20 sinh viên")).toBeInTheDocument();
    expect(
      within(
        screen.getByText("Lớp đang dạy", { selector: "span.text-\\[12\\.5px\\]" }).parentElement as HTMLElement
      ).getByText("1")
    ).toBeInTheDocument();
    expect(screen.getByText("Bài tập đang mở").nextElementSibling).toHaveTextContent("4");
    expect(screen.getByText("Sinh viên cần chú ý").nextElementSibling).toHaveTextContent("5");
    expect(screen.getByText("5 sinh viên cần chú ý - TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();
    expect(screen.getByText("2 bài tập nháp chưa đăng")).toBeInTheDocument();
    expect(progressApi.getProgress).toHaveBeenCalledWith("c1", expect.anything());
  });

  it("opens the class and the task targets by their real routes", async () => {
    mockApis();
    renderPage();
    await userEvent.click((await screen.findByText("TRD301 - Nhạc cụ truyền thống")).closest("button") as HTMLElement);
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c1");
    await userEvent.click(screen.getByRole("button", { name: "Xem bài tập" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/assignments");
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
    expect(await screen.findByText("TRD301 - Nhạc cụ truyền thống")).toBeInTheDocument();
  });
});
