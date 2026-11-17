import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeacherSubmissionResultPage } from "@/features/classes/pages/TeacherSubmissionResultPage";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import type { PracticeResult } from "@/features/practice/types/practiceResultTypes";

vi.mock("@/features/practice/api/practiceResultApi", () => ({
  practiceResultApi: { getResult: vi.fn(), getHistory: vi.fn(), getPitchChart: vi.fn(), getClassRank: vi.fn() },
}));
vi.mock("@/features/practice/components/ResultCardsGrid", () => ({
  ResultCardsGrid: (props: { classRank?: unknown; showSegments: boolean }) => (
    <div>cards rank={String(Boolean(props.classRank))} segments={String(props.showSegments)}</div>
  ),
}));
vi.mock("@/shared/components/bvc/AuthenticatedAudio", () => ({ AuthenticatedAudio: () => <div>student-audio</div> }));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const result = (status: PracticeResult["submission"]["status"]): PracticeResult =>
  ({
    submission: { id: "s2", status, submittedAt: "2026-11-03T02:00:00Z", analyzedAt: null, attemptNo: 2 },
    piece: { id: "p1", title: "Lý ngựa ô" },
    sheetMusic: null,
    assignment: { id: "a1", title: "Độc tấu", classId: "c1" },
    recording: { durationSec: 30 },
    scores: status === "COMPLETED" ? { overall: 80, pitch: 85, rhythm: 70, tempo: null } : null,
    tempo: null,
    aiFeedback: null,
    issues: [],
    qualityWarnings: [],
    audio: { teacherUrl: null, studentUrl: null },
    lecturerReview: {
      comment: null,
      canComment: true,
      student: { id: "st1", fullName: "Trần Minh Anh", studentCode: "SV001" },
      classId: "c1",
      attemptNo: 3,
    },
  }) as PracticeResult;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/teacher/classes/c1/students/st1/submissions/s2"]}>
      <Routes>
        <Route
          path="/teacher/classes/:classId/students/:studentId/submissions/:submissionId"
          element={<TeacherSubmissionResultPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("TeacherSubmissionResultPage", () => {
  beforeEach(() => {
    vi.mocked(practiceResultApi.getHistory).mockResolvedValue({ data: { data: { attempts: [] } } } as never);
    vi.mocked(practiceResultApi.getPitchChart).mockResolvedValue({ data: { data: null } } as never);
  });

  it("shows the result cards without class rank or segments, plus the comment panel", async () => {
    vi.mocked(practiceResultApi.getResult).mockResolvedValue({ data: { data: result("COMPLETED") } } as never);
    renderPage();
    expect(await screen.findByRole("heading", { name: "Trần Minh Anh" })).toBeInTheDocument();
    expect(screen.getByText("cards rank=false segments=false")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Nhận xét bài nộp" })).toBeInTheDocument();
    expect(practiceResultApi.getClassRank).not.toHaveBeenCalled();
  });

  it("shows the status and the recording for an unfinished submission", async () => {
    vi.mocked(practiceResultApi.getResult).mockResolvedValue({ data: { data: result("FAILED") } } as never);
    renderPage();
    expect(await screen.findByText("student-audio")).toBeInTheDocument();
    expect(screen.queryByText(/cards/)).not.toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Nhận xét bài nộp" })).toBeInTheDocument();
  });
});

function StatsProbe() {
  const from = (useLocation().state as { from?: string } | null)?.from;
  return <div>stats-page from={from ?? "none"}</div>;
}

describe("TeacherSubmissionResultPage numbering and navigation", () => {
  beforeEach(() => {
    vi.mocked(practiceResultApi.getHistory).mockResolvedValue({ data: { data: { attempts: [] } } } as never);
    vi.mocked(practiceResultApi.getPitchChart).mockResolvedValue({ data: { data: null } } as never);
    vi.mocked(practiceResultApi.getResult).mockResolvedValue({ data: { data: result("COMPLETED") } } as never);
  });

  it("labels the attempt with the lecturer numbering used on the stats page", async () => {
    renderPage();
    expect(await screen.findByText(/Độc tấu · Lần 3/)).toBeInTheDocument();
    expect(screen.getByText("Nhận xét · Lần 3")).toBeInTheDocument();
  });

  it("goes back to the stats page entry it came from, keeping that page's own back target", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/teacher/classes/c1/students/st1", state: { from: "/teacher/attention-students" } },
          { pathname: "/teacher/classes/c1/students/st1/submissions/s2", state: { from: "/teacher/classes/c1/students/st1" } },
        ]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/teacher/classes/:classId/students/:studentId" element={<StatsProbe />} />
          <Route
            path="/teacher/classes/:classId/students/:studentId/submissions/:submissionId"
            element={<TeacherSubmissionResultPage />}
          />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByRole("heading", { name: "Trần Minh Anh" });
    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(await screen.findByText("stats-page from=/teacher/attention-students")).toBeInTheDocument();
  });
});
