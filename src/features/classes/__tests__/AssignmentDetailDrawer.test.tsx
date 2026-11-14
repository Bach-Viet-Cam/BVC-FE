import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentListPage } from "@/features/classes/pages/AssignmentListPage";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import {
  type AssignmentDetail,
  type AssignmentOverview,
  type OverviewAssignment,
  type PracticeStats,
  type SheetGroupAssignment,
  type SheetGroupDetail,
} from "@/features/classes/types/teacherAssignmentTypes";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: {
    getOverview: vi.fn(),
    getAssignment: vi.fn(),
    getSheetGroup: vi.fn(),
    changeStatus: vi.fn(),
    deleteAssignment: vi.fn(),
    assignToClasses: vi.fn(),
    createAssignment: vi.fn(),
    listClassSheetMusic: vi.fn(),
  },
}));
vi.mock("@/features/classes/api/classesApi", () => ({
  classesApi: {
    listClasses: vi.fn().mockResolvedValue({
      data: {
        data: {
          items: [{ id: "c1", name: "TRD301", status: "ACTIVE" }],
          pagination: { page: 1, limit: 200, total: 1 },
          activeCount: 1,
          cohorts: [],
        },
      },
    }),
  },
}));

const SEMESTER = { name: "HK1 2026-2027", startDate: "2026-09-01", endDate: "2027-01-15" };
const STATS: PracticeStats = {
  totalPractices: 4,
  practicedStudents: 1,
  memberCount: 20,
  averagePerStudent: 4,
  last7Days: Array.from({ length: 7 }, (_, index) => ({ date: `2026-11-0${index + 1}`, count: 0 })),
};

function overviewAssignment(overrides: Partial<OverviewAssignment>): OverviewAssignment {
  return {
    id: "a1",
    classId: "c1",
    title: "Độc tấu - Lý ngựa ô",
    kind: "SOLO",
    status: "PUBLISHED",
    version: 1,
    sheetMusicId: "m1",
    sheetTitle: "Lý ngựa ô",
    practiceCount: 4,
    submittedCount: 1,
    memberCount: 20,
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

const OVERVIEW: AssignmentOverview = {
  semester: SEMESTER,
  emptyReason: null,
  sheetStats: [{ sheetMusicId: "m1", practicedStudents: 1, memberCount: 38, practiceCount: 4 }],
  classes: [
    { id: "c1", name: "TRD301", status: "ACTIVE", memberCount: 20, assignments: [overviewAssignment({})] },
    {
      id: "c2",
      name: "TRD302",
      status: "ACTIVE",
      memberCount: 18,
      assignments: [
        overviewAssignment({ id: "a2", classId: "c2", title: "Bonus Lý ngựa ô", kind: "BONUS" }),
        overviewAssignment({ id: "a3", classId: "c2", title: "Bài khác", sheetMusicId: null, sheetTitle: null }),
      ],
    },
  ],
};

const DETAIL: AssignmentDetail = {
  id: "a1",
  classId: "c1",
  className: "TRD301",
  classStatus: "ACTIVE",
  status: "PUBLISHED",
  version: 1,
  title: "Độc tấu - Lý ngựa ô",
  description: null,
  kind: "SOLO",
  sheetMusic: null,
  requiredBpm: null,
  effectiveBpm: 96,
  maxSubmissions: null,
  publishedAt: null,
  closedAt: null,
  updatedAt: "2026-10-01T00:00:00.000Z",
  students: [
    {
      studentId: "s1",
      fullName: "Trần Minh Anh",
      studentCode: "SE171234",
      status: "PASSED",
      submissionCount: 4,
      lastSubmittedAt: "2026-10-16T02:30:00.000Z",
      bestAccuracy: 82,
    },
  ],
  practiceStats: STATS,
  minAccuracy: 70,
  createdBy: null,
  media: null,
};

function groupCopy(overrides: Partial<SheetGroupAssignment>): SheetGroupAssignment {
  return {
    ...overviewAssignment({}),
    className: "TRD301",
    maxSubmissions: null,
    effectiveBpm: 96,
    minAccuracy: 70,
    publishedAt: null,
    createdBy: null,
    ...overrides,
  };
}

const GROUP: SheetGroupDetail = {
  semester: SEMESTER,
  sheetMusic: {
    id: "m1",
    name: "Bản chính",
    pieceId: "p1",
    pieceTitle: "Lý ngựa ô",
    defaultBpm: 96,
    isAvailable: true,
  },
  media: { sheet: null, referenceAudio: null, tutorialVideo: null },
  assignments: [
    groupCopy({}),
    groupCopy({ id: "a2", classId: "c2", className: "TRD302", title: "Bonus Lý ngựa ô", kind: "BONUS" }),
  ],
  practiceStats: STATS,
  byClass: [
    { classId: "c1", className: "TRD301", practicedStudents: 1, memberCount: 20 },
    { classId: "c2", className: "TRD302", practicedStudents: 0, memberCount: 18 },
  ],
};

const ok = <T,>(data: T) => ({ data: { data, message: "Thành công", success: true } }) as never;

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderAt(url: string) {
  const page = (
    <>
      <AssignmentListPage />
      <LocationProbe />
    </>
  );
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/teacher/assignments" element={page} />
        <Route path="/teacher/assignments/:assignmentId" element={page} />
      </Routes>
    </MemoryRouter>
  );
}

const drawer = () => screen.findByRole("dialog", { name: /Lý ngựa ô/ });

describe("AssignmentDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(assignmentsApi.getOverview).mockResolvedValue(ok(OVERVIEW));
    vi.mocked(assignmentsApi.getAssignment).mockResolvedValue(ok(DETAIL));
    vi.mocked(assignmentsApi.getSheetGroup).mockResolvedValue(ok(GROUP));
    vi.mocked(assignmentsApi.listClassSheetMusic).mockResolvedValue(ok([]));
  });

  it("opens class mode from /teacher/assignments/:id", async () => {
    renderAt("/teacher/assignments/a1");
    const dialog = await drawer();
    expect(within(dialog).getByText("Chi tiết bài tập")).toBeInTheDocument();
    expect(within(dialog).getByText("Độc tấu · TRD301")).toBeInTheDocument();
    expect(within(dialog).getByRole("tab", { name: "Thống kê luyện tập" })).toHaveAttribute("aria-selected", "true");
    const row = (await within(dialog).findByText("Trần Minh Anh")).closest("a") as HTMLElement;
    expect(row).toHaveAttribute("href", "/teacher/assignments/a1/students/s1");
    expect(within(dialog).getByText("Sinh viên (1)")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Sửa" })).toHaveAttribute("href", "/teacher/assignments/a1/edit");
    expect(within(dialog).getByRole("button", { name: "Đóng" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Xóa" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Gán bài này cho lớp khác" })).not.toBeInTheDocument();
    expect(assignmentsApi.getAssignment).toHaveBeenCalledWith("a1");
  });

  it("opens sheet mode from ?sheet=", async () => {
    renderAt("/teacher/assignments?tab=sheet&sheet=m1");
    const dialog = await drawer();
    expect(await within(dialog).findByText("Sinh viên đã tập theo lớp")).toBeInTheDocument();
    expect(within(dialog).getByText("Độc tấu, Bonus · 2 bài tập · 2 lớp")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Gán bài này cho lớp khác" })).toBeInTheDocument();
    expect(within(dialog).queryByText("Chỉnh sửa")).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
    expect(assignmentsApi.getSheetGroup).toHaveBeenCalledWith("m1");
  });

  it("closing returns to the list and keeps the sheet tab", async () => {
    renderAt("/teacher/assignments?tab=sheet&sheet=m1");
    const dialog = await drawer();
    await userEvent.click(within(dialog).getByRole("button", { name: "Đóng chi tiết" }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/teacher\/assignments\?tab=sheet$/)
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("tab", { name: /Theo bài tập chung/ })).toHaveAttribute("aria-selected", "true");
  });

  it("deleting closes the drawer and reloads the list", async () => {
    vi.mocked(assignmentsApi.deleteAssignment).mockResolvedValue({ data: { message: "Đã xóa bài tập" } } as never);
    renderAt("/teacher/assignments/a1");
    const dialog = await drawer();
    await within(dialog).findByText("Trần Minh Anh");
    expect(assignmentsApi.getOverview).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole("button", { name: "Xóa" }));
    const confirm = await screen.findByRole("dialog", { name: "Xóa bài tập Độc tấu - Lý ngựa ô?" });
    await userEvent.click(within(confirm).getByRole("button", { name: "Xóa" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(assignmentsApi.deleteAssignment).toHaveBeenCalledWith("a1");
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/teacher\/assignments$/);
    await waitFor(() => expect(assignmentsApi.getOverview).toHaveBeenCalledTimes(2));
  });

  it("opens over the semester empty notice", async () => {
    vi.mocked(assignmentsApi.getOverview).mockResolvedValue(
      ok({ ...OVERVIEW, emptyReason: "NO_CURRENT_SEMESTER", semester: null, classes: [], sheetStats: [] })
    );
    renderAt("/teacher/assignments/a1");
    const dialog = await drawer();
    expect(within(dialog).getByRole("heading", { name: "Độc tấu - Lý ngựa ô" })).toBeInTheDocument();
  });

  it("assign from sheet mode preselects the sheet's groups", async () => {
    renderAt("/teacher/assignments?tab=sheet&sheet=m1");
    const dialog = await drawer();
    await userEvent.click(await within(dialog).findByRole("button", { name: "Gán bài này cho lớp khác" }));
    const assign = await screen.findByRole("dialog", { name: "Gán bài tập cho lớp" });
    const sources = within(within(assign).getByRole("group", { name: "Bài tập" }));
    expect(sources.getByText("Độc tấu - Lý ngựa ô").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(sources.getByText("Bonus Lý ngựa ô").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(sources.getByText("Bài khác").closest("button")).toHaveAttribute("aria-pressed", "false");
    expect(sources.getByText("2 / 3 đã chọn")).toBeInTheDocument();
  });

  it("closing class mode opened from a class deep link returns to ?class=", async () => {
    renderAt("/teacher/assignments?class=c1");
    const row = (await screen.findByText("Độc tấu - Lý ngựa ô")).closest("a") as HTMLElement;
    await userEvent.click(row);
    const dialog = await drawer();
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/teacher\/assignments\/a1\?class=c1$/);
    await userEvent.click(within(dialog).getByRole("button", { name: "Đóng chi tiết" }));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(/^\/teacher\/assignments\?class=c1$/));
  });

  it("creating an assignment opens it in class mode and reloads the list", async () => {
    vi.mocked(assignmentsApi.createAssignment).mockResolvedValue(ok(DETAIL));
    renderAt("/teacher/assignments?create=assignment&classId=c1&kind=SOLO");
    const form = await screen.findByRole("dialog");
    await userEvent.type(await within(form).findByLabelText(/Tiêu đề/), "Độc tấu - Lý ngựa ô");
    expect(assignmentsApi.getOverview).toHaveBeenCalledTimes(1);
    await userEvent.click(within(form).getByRole("button", { name: "Lưu & Giao Bài" }));
    await drawer();
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/teacher\/assignments\/a1$/);
    await waitFor(() => expect(assignmentsApi.getOverview).toHaveBeenCalledTimes(2));
  });
});
