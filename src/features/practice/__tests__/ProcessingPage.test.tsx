import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RESULT_REDIRECT_MS } from "@/features/practice/constants/practiceConstants";
import { ProcessingPage } from "@/features/practice/pages/ProcessingPage";
import type { PracticeSubmission } from "@/features/practice/types/practiceSubmissionTypes";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";

const mocks = vi.hoisted(() => ({
  progress: vi.fn(),
  segment: vi.fn(),
  resultPart: vi.fn(),
}));

vi.mock("@/features/practice/hooks/useSubmissionProgress", () => ({ useSubmissionProgress: mocks.progress }));
vi.mock("@/features/practice/hooks/useSegmentAttempt", () => ({ useSegmentAttempt: mocks.segment }));
vi.mock("@/features/practice/hooks/useResultPart", () => ({ useResultPart: mocks.resultPart }));
vi.mock("@/features/practice/api/practiceResultApi", () => ({ practiceResultApi: { getResult: vi.fn() } }));
vi.mock("@/features/practice/context/PracticeDemoContext", () => ({
  usePracticeDemo: () => ({ lastSubmitted: null }),
}));
vi.mock("@/features/community/components/SubmissionVerification", () => ({
  SubmissionSharing: () => <div>sharing</div>,
}));
vi.mock("@/features/practice/components/PracticeFrame", () => ({
  PracticeFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/features/practice/components/PracticeTopBar", () => ({
  PracticeTopBar: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <header>
      {title} {subtitle}
    </header>
  ),
}));
vi.mock("@/features/practice/components/StageTracker", () => ({
  StageTracker: ({ stage }: { stage: number }) => <div data-testid="stage-tracker">{stage}</div>,
}));

const attempt = (status: SegmentAttempt["status"], error: SegmentAttempt["error"] = null): SegmentAttempt => ({
  id: "att-1",
  submissionId: "sub-1",
  startSec: 65,
  endSec: 80,
  status,
  stage: "COMPARISON",
  createdAt: "2026-11-03T10:00:00Z",
  analyzedAt: null,
  scores: null,
  issues: [],
  aiFeedback: null,
  error,
  comparison: { original: null, previous: null },
});

const submission = (status: PracticeSubmission["status"]) =>
  ({
    id: "sub-1",
    status,
    stage: "QUALITY_CHECK",
    retryAvailableAt: null,
    retryCount: 0,
    maxRetries: 3,
    isFileDeleted: false,
    errorMessage: null,
    rejectReason: null,
  }) as unknown as PracticeSubmission;

function Where() {
  const location = useLocation();
  return <div data-testid="where">{location.pathname + location.search}</div>;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/practice/submissions/:submissionId/processing" element={<ProcessingPage />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
}

const SEG_URL = "/practice/submissions/sub-1/processing?attempt=att-1";

beforeEach(() => {
  mocks.progress.mockReturnValue({
    submission: null,
    error: "",
    paused: false,
    retrying: false,
    resume: vi.fn(),
    retry: vi.fn(),
  });
  mocks.segment.mockReturnValue({ attempt: null, error: "", stopped: false });
  mocks.resultPart.mockReturnValue({
    data: { sheetMusic: { id: "sheet-9", name: "Bài" } },
    loading: false,
    error: "",
    reload: vi.fn(),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("ProcessingPage chế độ đoạn", () => {
  it("PROCESSING hiện StageTracker và phụ đề đoạn", () => {
    mocks.segment.mockReturnValue({ attempt: attempt("PROCESSING"), error: "", stopped: false });
    renderAt(SEG_URL);
    expect(screen.getByTestId("stage-tracker")).toBeInTheDocument();
    expect(screen.getByText(/Đoạn 01:05 – 01:20/)).toBeInTheDocument();
    expect(mocks.segment).toHaveBeenCalledWith("att-1");
    expect(mocks.progress).toHaveBeenCalledWith("");
  });

  it("COMPLETED tự chuyển sang kết quả có ?attempt=", () => {
    vi.useFakeTimers();
    mocks.segment.mockReturnValue({ attempt: attempt("COMPLETED"), error: "", stopped: true });
    renderAt(SEG_URL);
    act(() => void vi.advanceTimersByTime(RESULT_REDIRECT_MS + 10));
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/submissions/sub-1?attempt=att-1");
  });

  it("FAILED chỉ có nút Thu lại đoạn này, không có Thử lại", async () => {
    mocks.segment.mockReturnValue({
      attempt: attempt("FAILED", { code: "X", message: "Lỗi phân tích đoạn" }),
      error: "",
      stopped: true,
    });
    renderAt(SEG_URL);
    expect(screen.getByText("Lỗi phân tích đoạn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thử lại" })).not.toBeInTheDocument();
    expect(screen.queryByText("sharing")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thu lại đoạn này" }));
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/practice/sheets/sheet-9/record?of=sub-1&start=65&end=80&countIn=0"
    );
  });

  it("chưa có sheetId thì nút Thu lại bị khoá", () => {
    mocks.resultPart.mockReturnValue({ data: null, loading: true, error: "", reload: vi.fn() });
    mocks.segment.mockReturnValue({ attempt: attempt("REJECTED"), error: "", stopped: true });
    renderAt(SEG_URL);
    expect(screen.getByRole("button", { name: "Thu lại đoạn này" })).toBeDisabled();
  });
});

describe("ProcessingPage chế độ cả bài", () => {
  it("FAILED vẫn hiện nút Thử lại và không gọi nguồn đoạn", () => {
    mocks.progress.mockReturnValue({
      submission: submission("FAILED"),
      error: "",
      paused: false,
      retrying: false,
      resume: vi.fn(),
      retry: vi.fn(),
    });
    renderAt("/practice/submissions/sub-1/processing");
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thu lại đoạn này" })).not.toBeInTheDocument();
    expect(mocks.progress).toHaveBeenCalledWith("sub-1");
    expect(mocks.segment).toHaveBeenCalledWith(null);
    expect(mocks.resultPart.mock.calls[0][2]).toBe(false);
  });
});
