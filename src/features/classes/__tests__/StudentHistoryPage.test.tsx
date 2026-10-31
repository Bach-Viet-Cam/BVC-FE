import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { StudentHistoryPage } from "@/features/classes/pages/StudentHistoryPage";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: { listAssignments: vi.fn(), getStudentSubmissions: vi.fn(), saveComment: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const assignment = (id: string, kind: string, title: string, status = "PUBLISHED") => ({
  id,
  classId: "c1",
  className: "TRD301",
  status,
  version: 1,
  title,
  kind,
  submittedCount: 1,
  memberCount: 20,
  updatedAt: "2026-10-16T02:30:00.000Z",
});

const submissions = (count: number) => ({
  data: {
    data: {
      student: { id: "s1", fullName: "Trần Minh Anh", studentCode: "SE1" },
      canComment: true,
      submissions: Array.from({ length: count }, (_, index) => ({
        id: `x${count}-${index}`,
        attemptNumber: count - index,
        version: 1,
        status: "COMPLETED",
        accuracy: 80,
        tempoDeviation: 0,
        audioUrl: "/samples/bvc-sample.wav",
        submittedAt: "2026-10-16T02:30:00.000Z",
        comment: null,
      })),
    },
  },
});

describe("StudentHistoryPage", () => {
  it("shows one tab per published assignment, solo first, and the student's submissions of the chosen one", async () => {
    vi.mocked(assignmentsApi.listAssignments).mockResolvedValue({
      data: {
        data: {
          items: [
            assignment("ens", "ENSEMBLE", "Lý ngựa ô"),
            assignment("draft", "BONUS", "Nháp", "DRAFT"),
            assignment("solo", "SOLO", "Trống cơm"),
          ],
          pagination: { page: 1, limit: 100, total: 3 },
        },
      },
    } as never);
    vi.mocked(assignmentsApi.getStudentSubmissions).mockImplementation((async (assignmentId: string) =>
      submissions(assignmentId === "solo" ? 2 : 1)) as never);

    render(
      <MemoryRouter initialEntries={["/teacher/classes/c1/students/s1"]}>
        <Routes>
          <Route path="/teacher/classes/:classId/students/:studentId" element={<StudentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Trần Minh Anh")).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Độc tấu · Trống cơm", "Hòa tấu · Lý ngựa ô"]);
    expect(assignmentsApi.listAssignments).toHaveBeenCalledWith(expect.objectContaining({ classId: "c1" }));
    expect(await screen.findAllByLabelText("Nhận xét")).toHaveLength(2);

    await userEvent.click(tabs[1]);
    expect(assignmentsApi.getStudentSubmissions).toHaveBeenLastCalledWith("ens", "s1");
    await vi.waitFor(() => expect(screen.getAllByLabelText("Nhận xét")).toHaveLength(1));
  });
});
