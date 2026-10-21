import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { classesApi } from "@/features/classes/api/classesApi";
import { ReviewPage } from "@/features/classes/pages/ReviewPage";

vi.mock("@/features/classes/api/classesApi", () => ({ classesApi: { listClasses: vi.fn() } }));
vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: {
    listAssignments: vi.fn(),
    getAssignment: vi.fn(),
    getStudentSubmissions: vi.fn(),
    saveComment: vi.fn(),
  },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const CLASS = {
  id: "c1",
  name: "TRD301",
  cohort: "FA26",
  status: "ACTIVE",
  instrument: { id: "i1", name: "Đàn tranh" },
  startDate: "2026-09-30",
  endDate: "2026-11-11",
  memberCount: 20,
};
const ASSIGNMENT_ITEM = (id: string, title: string, status: string, submittedCount: number) => ({
  id,
  classId: "c1",
  className: "TRD301",
  status,
  version: 1,
  title,
  kind: "SOLO",
  submittedCount,
  memberCount: 20,
  updatedAt: "2026-10-16T02:30:00.000Z",
});
const STUDENTS = [
  {
    studentId: "s1",
    fullName: "Bùi Tuấn Kiệt",
    studentCode: "SE1",
    status: "PASSED",
    submissionCount: 2,
    lastSubmittedAt: "2026-10-15T02:30:00.000Z",
    bestAccuracy: 90,
  },
  {
    studentId: "s2",
    fullName: "Cao Minh Quân",
    studentCode: "SE2",
    status: "SUBMITTED",
    submissionCount: 1,
    lastSubmittedAt: "2026-10-16T02:30:00.000Z",
    bestAccuracy: 60,
  },
  {
    studentId: "s3",
    fullName: "Chưa Nộp",
    studentCode: "SE3",
    status: "NOT_SUBMITTED",
    submissionCount: 0,
    lastSubmittedAt: null,
    bestAccuracy: null,
  },
];
const submissionsOf = (studentId: string) => ({
  student: { id: studentId, fullName: studentId, studentCode: null },
  canComment: true,
  submissions: [
    {
      id: `sub-${studentId}`,
      attemptNumber: 1,
      version: 1,
      status: "COMPLETED",
      accuracy: 80,
      tempoDeviation: 2,
      audioUrl: "/samples/bvc-sample.wav",
      submittedAt: "2026-10-16T02:30:00.000Z",
      comment: null,
    },
  ],
});

function mockApis(assignmentItems = [ASSIGNMENT_ITEM("a1", "Độc tấu - Lý ngựa ô", "PUBLISHED", 2)], classes = [CLASS]) {
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
  vi.mocked(assignmentsApi.listAssignments).mockResolvedValue({
    data: { data: { items: assignmentItems, pagination: { page: 1, limit: 100, total: assignmentItems.length } } },
  } as never);
  vi.mocked(assignmentsApi.getAssignment).mockResolvedValue({ data: { data: { students: STUDENTS } } } as never);
  vi.mocked(assignmentsApi.getStudentSubmissions).mockImplementation((async (_a: string, studentId: string) => ({
    data: { data: submissionsOf(studentId) },
  })) as never);
  vi.mocked(assignmentsApi.saveComment).mockResolvedValue({
    data: { data: { content: "Tốt", updatedAt: "2026-10-16T03:00:00.000Z" }, message: "Gửi nhận xét thành công." },
  } as never);
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <ReviewPage />
    </MemoryRouter>
  );

describe("ReviewPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queues the students who submitted, newest first, and opens the first one", async () => {
    mockApis();
    renderPage();
    expect(await screen.findByText("Hàng đợi nhận xét · 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("Cao Minh Quân - Độc tấu - Lý ngựa ô")).toBeInTheDocument();
    expect(screen.queryByText("Chưa Nộp")).not.toBeInTheDocument();
    expect(assignmentsApi.getStudentSubmissions).toHaveBeenCalledWith("a1", "s2");
    expect(await screen.findByLabelText("Nhận xét")).toBeInTheDocument();
  });

  it("moves between students with the queue and the previous / next buttons", async () => {
    mockApis();
    renderPage();
    await screen.findByText("Hàng đợi nhận xét · 1 / 2");
    expect(screen.getByRole("button", { name: "Bài trước" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Bài sau" }));
    expect(await screen.findByText("Hàng đợi nhận xét · 2 / 2")).toBeInTheDocument();
    expect(assignmentsApi.getStudentSubmissions).toHaveBeenLastCalledWith("a1", "s1");
    expect(screen.getByRole("button", { name: "Bài sau" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Cao Minh Quân/ }));
    expect(await screen.findByText("Hàng đợi nhận xét · 1 / 2")).toBeInTheDocument();
  });

  it("saves a comment for the opened submission", async () => {
    mockApis();
    renderPage();
    await userEvent.type(await screen.findByLabelText("Nhận xét"), "Tốt");
    await userEvent.click(screen.getByRole("button", { name: "Gửi nhận xét" }));
    await vi.waitFor(() => expect(assignmentsApi.saveComment).toHaveBeenCalledWith("sub-s2", "Tốt"));
  });

  it("leaves out drafts and loads the picked assignment", async () => {
    mockApis([
      ASSIGNMENT_ITEM("a1", "Độc tấu - Lý ngựa ô", "PUBLISHED", 2),
      ASSIGNMENT_ITEM("a2", "Bonus - Ngẫu hứng", "CLOSED", 1),
      ASSIGNMENT_ITEM("a3", "Bài nháp", "DRAFT", 0),
    ]);
    renderPage();
    await screen.findByText("Hàng đợi nhận xét · 1 / 2");
    expect(screen.queryByRole("option", { name: /Bài nháp/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Chọn bài tập"), "a2");
    await vi.waitFor(() => expect(assignmentsApi.getAssignment).toHaveBeenLastCalledWith("a2"));
  });

  it("explains an empty queue, a class without published assignment and a lecturer without class", async () => {
    mockApis();
    vi.mocked(assignmentsApi.getAssignment).mockResolvedValue({
      data: { data: { students: [STUDENTS[2]] } },
    } as never);
    const first = renderPage();
    expect(await screen.findByText("Chưa có sinh viên nào nộp bài.")).toBeInTheDocument();
    first.unmount();

    mockApis([ASSIGNMENT_ITEM("a3", "Bài nháp", "DRAFT", 0)]);
    const second = renderPage();
    expect(await screen.findByText("Lớp chưa có bài tập nào đã đăng.")).toBeInTheDocument();
    second.unmount();

    mockApis([], []);
    renderPage();
    expect(await screen.findByText("Bạn chưa có lớp nào.")).toBeInTheDocument();
  });

  it("shows the load error with a retry that refetches", async () => {
    mockApis();
    vi.mocked(classesApi.listClasses).mockRejectedValueOnce(new Error("boom"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Tải dữ liệu thất bại");
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Hàng đợi nhận xét · 1 / 2")).toBeInTheDocument();
  });
});
