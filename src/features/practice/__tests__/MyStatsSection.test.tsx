import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyStatsSection } from "@/features/practice/components/MyStatsSection";
import { studentStatsApi } from "@/features/practice/api/studentStatsApi";
import type { StudentStats } from "@/features/practice/types/studentStatsTypes";

vi.mock("@/features/practice/api/studentStatsApi", () => ({ studentStatsApi: { getMine: vi.fn() } }));

const scored = {
  id: "a1",
  title: "Độc tấu",
  kind: "SOLO" as const,
  bestAccuracy: 80,
  attemptCount: 1,
  attempts: [
    { submissionId: "s1", attemptNo: 1, submittedAt: "2026-11-01T02:00:00Z", status: "COMPLETED" as const, accuracy: 80, hasComment: false },
  ],
};

const stats = (overrides: Partial<StudentStats> = {}): StudentStats => ({
  student: { id: "st1", fullName: "Trần Minh Anh", studentCode: "SV001" },
  class: { id: "c1", name: "TRD301", cohort: "K68", status: "ACTIVE" },
  evaluation: { content: "Tiến bộ tốt", lecturerName: "Nguyễn Thu Hương", updatedAt: "2026-11-13T03:00:00.000Z" },
  canEvaluate: false,
  classes: [{ id: "c1", name: "TRD301", cohort: "K68", status: "ACTIVE" }],
  assignments: [scored],
  ...overrides,
});

const respond = (data: StudentStats | null) =>
  vi.mocked(studentStatsApi.getMine).mockResolvedValue({ data: { data } } as never);

describe("MyStatsSection", () => {
  beforeEach(() => vi.mocked(studentStatsApi.getMine).mockReset());

  it("renders nothing when the student has no class", async () => {
    respond(null);
    const { container } = render(<MyStatsSection />);
    await vi.waitFor(() => expect(studentStatsApi.getMine).toHaveBeenCalled());
    await Promise.resolve();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the lecturer's evaluation", async () => {
    respond(stats());
    render(<MyStatsSection />);
    expect(await screen.findByText("Tiến bộ tốt")).toBeInTheDocument();
    expect(screen.getByText(/Nguyễn Thu Hương/)).toBeInTheDocument();
  });

  it("hides the evaluation card without an evaluation", async () => {
    respond(stats({ evaluation: null }));
    render(<MyStatsSection />);
    expect(await screen.findByText("Độ chính xác qua các lần nộp")).toBeInTheDocument();
    expect(screen.queryByText("Đánh giá của giảng viên")).not.toBeInTheDocument();
  });

  it("hides the chart when nothing is scored yet", async () => {
    respond(stats({ assignments: [{ ...scored, bestAccuracy: null, attemptCount: 0, attempts: [] }] }));
    render(<MyStatsSection />);
    expect(await screen.findByText("Tiến bộ tốt")).toBeInTheDocument();
    expect(screen.queryByText("Độ chính xác qua các lần nộp")).not.toBeInTheDocument();
  });

  it("switches class when the student has several", async () => {
    respond(
      stats({
        classes: [
          { id: "c1", name: "TRD301", cohort: "K68", status: "ACTIVE" },
          { id: "c0", name: "TRD101", cohort: "K67", status: "ENDED" },
        ],
      })
    );
    render(<MyStatsSection />);
    await userEvent.selectOptions(await screen.findByRole("combobox", { name: "Chọn lớp" }), "c0");
    await vi.waitFor(() => expect(studentStatsApi.getMine).toHaveBeenLastCalledWith("c0"));
  });

  it("shows a retry message on failure without blocking the page", async () => {
    vi.mocked(studentStatsApi.getMine).mockRejectedValueOnce(new Error("boom"));
    render(<MyStatsSection />);
    expect(await screen.findByText("Tải thống kê thất bại. Vui lòng thử lại.")).toBeInTheDocument();
    respond(stats());
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Tiến bộ tốt")).toBeInTheDocument();
  });
});
