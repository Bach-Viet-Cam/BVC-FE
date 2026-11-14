import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentStatsPage } from "@/features/classes/pages/StudentStatsPage";
import { studentStatsApi } from "@/features/practice/api/studentStatsApi";
import type { StudentStats } from "@/features/practice/types/studentStatsTypes";

vi.mock("@/features/practice/api/studentStatsApi", () => ({
  studentStatsApi: { getForLecturer: vi.fn(), saveEvaluation: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
});

const stats: StudentStats = {
  student: { id: "st1", fullName: "Trần Minh Anh", studentCode: "SV001" },
  class: { id: "c1", name: "TRD301", cohort: "K68", status: "ACTIVE" },
  evaluation: null,
  canEvaluate: true,
  assignments: [
    {
      id: "a1",
      title: "Độc tấu",
      kind: "SOLO",
      bestAccuracy: 92,
      attemptCount: 2,
      attempts: [
        { submissionId: "s1", attemptNo: 1, submittedAt: "2026-11-01T02:00:00Z", status: "COMPLETED", accuracy: 70, hasComment: false },
        { submissionId: "s2", attemptNo: 2, submittedAt: "2026-11-03T02:00:00Z", status: "COMPLETED", accuracy: 92, hasComment: true },
      ],
    },
    {
      id: "a2",
      title: "Hòa tấu",
      kind: "ENSEMBLE",
      bestAccuracy: 60,
      attemptCount: 1,
      attempts: [
        { submissionId: "s3", attemptNo: 1, submittedAt: "2026-11-02T02:00:00Z", status: "COMPLETED", accuracy: 60, hasComment: false },
      ],
    },
    { id: "a3", title: "Bài thêm", kind: "BONUS", bestAccuracy: null, attemptCount: 0, attempts: [] },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/teacher/classes/c1/students/st1"]}>
      <Routes>
        <Route path="/teacher/classes/:classId/students/:studentId" element={<StudentStatsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const attemptRows = () => within(screen.getByRole("list", { name: "Lịch sử nộp bài" })).getAllByRole("listitem");

describe("StudentStatsPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(studentStatsApi.getForLecturer).mockResolvedValue({ data: { data: stats } } as never);
  });

  it("shows the student and the class in the header", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Trần Minh Anh" })).toBeInTheDocument();
    expect(screen.getAllByText("SV001 · TRD301 · K68").length).toBeGreaterThan(0);
  });

  it("shows a best-score card per assignment, with a dash when nothing was scored", async () => {
    renderPage();
    const best = await screen.findByRole("group", { name: "Điểm cao nhất" });
    expect(within(best).getByRole("button", { name: /Độc tấu.*92%.*2 lần/ })).toBeInTheDocument();
    expect(within(best).getByRole("button", { name: /Bài thêm.*-.*0 lần/ })).toBeInTheDocument();
  });

  it("lists attempts newest first and marks commented ones", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Trần Minh Anh" });
    const rows = attemptRows();
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("Độc tấu · Lần 2"),
      expect.stringContaining("Hòa tấu · Lần 1"),
      expect.stringContaining("Độc tấu · Lần 1"),
    ]);
    expect(rows[0]).toHaveTextContent("Đã nhận xét");
    expect(rows[1]).not.toHaveTextContent("Đã nhận xét");
  });

  it("filters the history by clicking a best-score card", async () => {
    renderPage();
    const best = await screen.findByRole("group", { name: "Điểm cao nhất" });
    await userEvent.click(within(best).getByRole("button", { name: /Hòa tấu/ }));
    expect(attemptRows()).toHaveLength(1);
    expect(attemptRows()[0]).toHaveTextContent("Hòa tấu · Lần 1");
  });

  it("opens the submission page from a history row", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Trần Minh Anh" });
    await userEvent.click(within(attemptRows()[0]).getByRole("button"));
    expect(navigate).toHaveBeenCalledWith("/teacher/classes/c1/students/st1/submissions/s2", {
      state: { from: "/teacher/classes/c1/students/st1" },
    });
  });
});
