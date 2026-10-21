import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { StudentSubmissionsPage } from "@/features/classes/pages/StudentSubmissionsPage";
import { assignmentsApi } from "@/features/classes/api/assignmentsApi";

vi.mock("@/features/classes/api/assignmentsApi", () => ({
  assignmentsApi: { getStudentSubmissions: vi.fn(), saveComment: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const submission = (id: string, attemptNumber: number) => ({
  id,
  attemptNumber,
  version: 1,
  status: "COMPLETED",
  accuracy: 80,
  tempoDeviation: 0,
  audioUrl: "/samples/bvc-sample.wav",
  submittedAt: "2026-10-16T02:30:00.000Z",
  comment: null,
});

describe("StudentSubmissionsPage", () => {
  it("keeps unsent text in other cards after saving one comment", async () => {
    vi.mocked(assignmentsApi.getStudentSubmissions).mockResolvedValue({
      data: {
        data: {
          student: { id: "s1", fullName: "Trần Minh Anh", studentCode: "SE1" },
          canComment: true,
          submissions: [submission("x2", 2), submission("x1", 1)],
        },
      },
    } as never);
    vi.mocked(assignmentsApi.saveComment).mockResolvedValue({
      data: { data: { content: "A", updatedAt: "2026-10-16T03:00:00.000Z" }, message: "Gửi nhận xét thành công." },
    } as never);
    render(
      <MemoryRouter initialEntries={["/teacher/assignments/a1/students/s1"]}>
        <Routes>
          <Route path="/teacher/assignments/:assignmentId/students/:studentId" element={<StudentSubmissionsPage />} />
        </Routes>
      </MemoryRouter>
    );
    const [first, second] = await screen.findAllByLabelText("Nhận xét");
    await userEvent.type(second, "Đang viết dở");
    await userEvent.type(first, "A");
    await userEvent.click(screen.getAllByRole("button", { name: "Gửi nhận xét" })[0]);
    await vi.waitFor(() => expect(assignmentsApi.getStudentSubmissions).toHaveBeenCalledTimes(2));
    expect(screen.getAllByLabelText("Nhận xét")[1]).toHaveValue("Đang viết dở");
  });
});
