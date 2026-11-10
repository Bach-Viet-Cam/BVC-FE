import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { ResultsPage } from "@/features/practice/pages/ResultsPage";
import type { PracticeResult } from "@/features/practice/types/practiceResultTypes";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";

vi.mock("@/features/practice/api/practiceResultApi", () => ({
  practiceResultApi: { getResult: vi.fn(), getHistory: vi.fn(), getClassRank: vi.fn(), getPitchChart: vi.fn() },
}));
vi.mock("@/features/practice/api/practiceSegmentApi", () => ({
  practiceSegmentApi: { getPitchChart: vi.fn(), get: vi.fn(), listBySubmission: vi.fn() },
}));

const segmentState: { attempt: SegmentAttempt | null } = { attempt: null };
vi.mock("@/features/practice/hooks/useSegmentAttempt", () => ({
  useSegmentAttempt: (id: string | null) => ({ attempt: id ? segmentState.attempt : null, error: "", stopped: false }),
}));
vi.mock("@/features/practice/hooks/useSegmentAttempts", () => ({
  useSegmentAttempts: () => ({ items: [], hasMore: false, loading: false, loadMore: vi.fn() }),
}));

vi.mock("@/shared/components/bvc/StudentShell", () => ({
  StudentShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/features/practice/components/ResultBanner", () => ({ ResultBanner: () => null }));
vi.mock("@/features/community/components/SubmissionVerification", () => ({
  SubmissionSharing: () => <div data-testid="sharing" />,
}));
vi.mock("@/features/practice/components/ClassRankCard", () => ({
  ClassRankCard: () => <div data-testid="class-rank" />,
}));
vi.mock("@/features/practice/components/ProgressHistoryCard", () => ({
  ProgressHistoryCard: () => <div data-testid="history" />,
}));
vi.mock("@/features/practice/components/PitchContourCard", () => ({
  PitchContourCard: () => <div data-testid="pitch-card" />,
}));
vi.mock("@/features/practice/components/AiFeedbackCard", () => ({ AiFeedbackCard: () => <div data-testid="ai" /> }));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const RESULT = {
  submission: { id: "sub-1", status: "COMPLETED", submittedAt: "2026-11-03T10:00:00Z", analyzedAt: null, attemptNo: 1 },
  piece: { id: "p1", title: "Bèo dạt mây trôi" },
  sheetMusic: { id: "sheet-9", name: "Bản 1" },
  assignment: { id: "a1", title: "BT", classId: "c1" },
  recording: { durationSec: 120 },
  scores: { overall: 58, pitch: 60, rhythm: 55, tempo: 90 },
  tempo: null,
  aiFeedback: { text: "Tốt", isFallback: false },
  issues: [],
  qualityWarnings: [],
  audio: { teacherUrl: null, studentUrl: null },
} as PracticeResult;

const ATTEMPT: SegmentAttempt = {
  id: "att-1",
  submissionId: "sub-1",
  startSec: 65,
  endSec: 95,
  status: "COMPLETED",
  stage: null,
  createdAt: "2026-11-03T10:00:00Z",
  analyzedAt: null,
  scores: { overall: 76, pitch: 80, rhythm: 70 },
  issues: [],
  aiFeedback: { text: "Đoạn ổn", isFallback: false },
  error: null,
  comparison: { original: { overall: 58, pitch: 60, rhythm: 55 }, previous: null },
};

const CHART = { durationSec: 120, minHz: 100, maxHz: 500, points: [], segments: [], timeMap: [] };

function Where() {
  const location = useLocation();
  return <div data-testid="where">{location.pathname + location.search}</div>;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/practice/submissions/:submissionId" element={<ResultsPage />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
}

// Các mock API chỉ cần phần `data.data` của phản hồi axios
const ok = (value: unknown) => ({ data: { data: value } }) as never;

beforeEach(() => {
  vi.mocked(practiceResultApi.getResult).mockReset().mockResolvedValue(ok(RESULT));
  vi.mocked(practiceResultApi.getHistory)
    .mockReset()
    .mockResolvedValue(
      ok({ pieceTitle: "x", isFirstAttempt: false, deltaPercent: 1, bestPercent: 60, attempts: [{}] })
    );
  vi.mocked(practiceResultApi.getClassRank).mockReset().mockResolvedValue(ok(null));
  vi.mocked(practiceResultApi.getPitchChart).mockReset().mockResolvedValue(ok(CHART));
  vi.mocked(practiceSegmentApi.getPitchChart)
    .mockReset()
    .mockResolvedValue(ok({ ...CHART, durationSec: 30 }));
  segmentState.attempt = ATTEMPT;
});

describe("ResultsPage chế độ đoạn", () => {
  it("hiện tiêu đề, phụ đề, dải so sánh và ẩn Sharing / ClassRank / History", async () => {
    renderAt("/practice/submissions/sub-1?attempt=att-1");
    expect(await screen.findByText("Kết quả đoạn")).toBeInTheDocument();
    expect(await screen.findByText("Bèo dạt mây trôi · đoạn 01:05 – 01:35")).toBeInTheDocument();
    expect(await screen.findByText(/So với bản gốc: 58% → 76% \(\+18\)/)).toBeInTheDocument();
    expect(screen.getByTestId("ai")).toBeInTheDocument();
    expect(screen.getByTestId("pitch-card")).toBeInTheDocument();
    expect(screen.queryByTestId("sharing")).not.toBeInTheDocument();
    expect(screen.queryByTestId("class-rank")).not.toBeInTheDocument();
    expect(screen.queryByTestId("history")).not.toBeInTheDocument();
    expect(screen.queryByText("Các lần luyện đoạn")).not.toBeInTheDocument();
    expect(practiceResultApi.getHistory).not.toHaveBeenCalled();
    expect(practiceResultApi.getClassRank).not.toHaveBeenCalled();
  });

  it("điểm null hiện thông báo không có nốt", async () => {
    segmentState.attempt = { ...ATTEMPT, scores: { overall: null, pitch: null, rhythm: null } };
    renderAt("/practice/submissions/sub-1?attempt=att-1");
    expect(await screen.findByText("Đoạn này không có nốt để chấm")).toBeInTheDocument();
  });

  it("lượt FAILED hiện thông báo và dòng giữ kết quả cũ", async () => {
    segmentState.attempt = { ...ATTEMPT, status: "FAILED", scores: null, error: null };
    renderAt("/practice/submissions/sub-1?attempt=att-1");
    expect(await screen.findByText(/Kết quả cũ vẫn được giữ nguyên/)).toBeInTheDocument();
  });

  it("lượt PROCESSING chuyển sang màn Chờ của lượt đó", async () => {
    segmentState.attempt = { ...ATTEMPT, status: "PROCESSING", scores: null };
    renderAt("/practice/submissions/sub-1?attempt=att-1");
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent("/practice/submissions/sub-1/processing?attempt=att-1")
    );
  });

  it("sheet có mục Thu lại đoạn này và điều hướng sang record cùng đoạn", async () => {
    const user = userEvent.setup();
    renderAt("/practice/submissions/sub-1?attempt=att-1");
    await user.click(await screen.findByRole("button", { name: /Luyện tập lại/ }));
    await user.click(await screen.findByText("Thu lại đoạn này (01:05 - 01:35)"));
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/practice/sheets/sheet-9/record?of=sub-1&start=65&end=95&countIn=0"
    );
  });
});

describe("ResultsPage chế độ cả bài", () => {
  it("giữ Sharing / ClassRank / History và sheet không có mục Thu lại đoạn này", async () => {
    const user = userEvent.setup();
    vi.mocked(practiceResultApi.getClassRank).mockResolvedValue(
      ok({
        className: "C",
        peerCount: 5,
        minPeers: 3,
        hasEnoughPeers: true,
        myScore: 58,
        classAverage: 60,
        betterThanPercent: 40,
        topPercent: 60,
        distribution: [],
      })
    );
    renderAt("/practice/submissions/sub-1");
    expect(await screen.findByTestId("sharing")).toBeInTheDocument();
    expect(await screen.findByTestId("class-rank")).toBeInTheDocument();
    expect(await screen.findByTestId("history")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Luyện tập lại/ }));
    expect(await screen.findByText("Chọn chế độ luyện tập")).toBeInTheDocument();
    expect(screen.queryByText(/Thu lại đoạn này/)).not.toBeInTheDocument();
  });
});
