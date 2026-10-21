import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentInfoPanel } from "@/features/classes/components/AssignmentInfoPanel";
import { TeacherAssignmentDetailPage } from "@/features/classes/pages/TeacherAssignmentDetailPage";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { type AssignmentDetail, type AssignmentStatus } from "@/features/classes/types/teacherAssignmentTypes";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: { getAssignment: vi.fn(), changeStatus: vi.fn(), deleteAssignment: vi.fn() },
}));

function buildAssignment(overrides: Partial<AssignmentDetail> = {}): AssignmentDetail {
  return {
    id: "a1",
    classId: "c1",
    className: "TRD301",
    classStatus: "ACTIVE",
    status: "PUBLISHED",
    version: 2,
    title: "Độc tấu — Lý ngựa ô",
    description: "Tập chậm",
    kind: "SOLO",
    piece: { id: "p1", title: "Lý ngựa ô", defaultBpm: 96, isAvailable: false },
    requiredBpm: null,
    effectiveBpm: 96,
    publishedAt: "2026-10-15T02:00:00.000Z",
    closedAt: null,
    updatedAt: "2026-10-16T02:00:00.000Z",
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
    ...overrides,
  };
}

const renderPanel = (assignment: AssignmentDetail) =>
  render(
    <MemoryRouter>
      <AssignmentInfoPanel assignment={assignment} onAction={vi.fn()} />
    </MemoryRouter>
  );

const buttonNames = () => screen.queryAllByRole("button").map((button) => button.textContent);

describe("Teacher assignment detail", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each<[AssignmentStatus, string[]]>([
    ["DRAFT", ["Đăng", "Xóa"]],
    ["PUBLISHED", ["Đóng", "Xóa"]],
    ["CLOSED", ["Mở lại", "Xóa"]],
  ])("%s shows Sửa plus %s", (status, buttons) => {
    renderPanel(buildAssignment({ status }));
    expect(screen.getByRole("link", { name: "Sửa" })).toHaveAttribute("href", "/teacher/assignments/a1/edit");
    expect(buttonNames()).toEqual(buttons);
  });

  it("disables actions while a request is running", () => {
    render(
      <MemoryRouter>
        <AssignmentInfoPanel assignment={buildAssignment({ status: "DRAFT" })} isWorking onAction={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Đăng" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Xóa" })).toBeDisabled();
  });

  it("shows no action in a finished class", () => {
    renderPanel(buildAssignment({ classStatus: "ENDED", status: "CLOSED" }));
    expect(screen.queryByRole("link", { name: "Sửa" })).not.toBeInTheDocument();
    expect(buttonNames()).toEqual([]);
  });

  it("shows version, kind, effective BPM and an unavailable piece", () => {
    renderPanel(buildAssignment());
    expect(screen.getByText("Phiên bản v2")).toBeInTheDocument();
    expect(screen.getByText("Độc tấu")).toBeInTheDocument();
    expect(screen.getByText("96 BPM")).toBeInTheDocument();
    expect(screen.getByText("Không còn khả dụng")).toBeInTheDocument();
  });

  it("asks for confirmation before closing and lists students with their summary", async () => {
    vi.mocked(assignmentsApi.getAssignment).mockResolvedValue({
      data: { data: buildAssignment(), message: "", success: true },
    } as never);
    render(
      <MemoryRouter initialEntries={["/teacher/assignments/a1"]}>
        <Routes>
          <Route path="/teacher/assignments/:assignmentId" element={<TeacherAssignmentDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    const row = (await screen.findByText("Trần Minh Anh")).closest("a") as HTMLElement;
    expect(row).toHaveAttribute("href", "/teacher/assignments/a1/students/s1");
    expect(within(row).getByText("Đạt")).toBeInTheDocument();
    expect(within(row).getByText("4 lần nộp · gần nhất 16/10 09:30 · cao nhất 82%")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Đóng bài tập Độc tấu — Lý ngựa ô?")).toBeInTheDocument();
    expect(within(dialog).getByText("Sinh viên sẽ không thể nộp bài nữa.")).toBeInTheDocument();
    expect(assignmentsApi.changeStatus).not.toHaveBeenCalled();
  });
});
