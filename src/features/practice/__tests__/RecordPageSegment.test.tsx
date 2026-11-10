import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { RecordPage } from "@/features/practice/pages/RecordPage";
import { toast } from "@/shared/components/ui/toast";

const send = vi.fn();
const reset = vi.fn();
const take = { file: new File(["x"], "take.wav"), url: "blob:x", peaks: [] as number[] };

vi.mock("@/shared/components/ui/toast", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock("@/shared/components/bvc/StudentShell", () => ({
  StudentShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("@/features/practice/context/PracticeDemoContext", () => ({
  usePracticeDemo: () => ({
    demo: { expired: false, micDenied: false, otherProc: false, noPitch: false, invalid: "none", autoStop: false },
    blocked: false,
    submit: vi.fn(),
    uploading: false,
    uploadWeak: false,
  }),
}));
vi.mock("@/features/practice/hooks/usePracticeContext", () => ({
  usePracticeContext: () => ({
    context: {
      piece: { id: "p1", title: "Bài thử" },
      sheet: { id: "s1", name: "Bản A", instrument: { name: "Violin" }, referenceAudio: null },
      classRecord: null,
      assignment: null,
    },
    isLoading: false,
    error: null,
  }),
}));
vi.mock("@/features/practice/hooks/usePracticeTargetBpm", () => ({ usePracticeTargetBpm: () => ({ targetBpm: 60 }) }));
vi.mock("@/features/practice/hooks/useInstrumentTunes", () => ({ useInstrumentTunes: () => [] }));
vi.mock("@/features/practice/hooks/useActiveSubmission", () => ({
  useActiveSubmission: () => ({ active: null, refresh: vi.fn() }),
}));
vi.mock("@/features/practice/hooks/usePracticeAudio", () => ({
  usePracticeAudio: () => ({
    micState: "granted",
    ready: true,
    analyser: null,
    ctx: { resume: vi.fn() },
    retryMic: vi.fn(),
  }),
}));
vi.mock("@/features/practice/hooks/usePitchStream", () => ({ usePitchStream: () => ({ subscribe: vi.fn() }) }));
vi.mock("@/features/practice/hooks/useLiveTuner", () => ({
  useLiveTuner: () => ({ live: false, cents: 0, detectedNote: null, detectedHz: null }),
}));
vi.mock("@/features/practice/hooks/useLiveTempo", () => ({ useLiveTempo: () => ({ liveBpm: null }) }));
vi.mock("@/features/practice/hooks/useClickTrack", () => ({
  useClickTrack: () => ({ litBeat: -1, getClickTimes: () => [] }),
}));
vi.mock("@/features/practice/hooks/useFilePreview", () => ({
  useFilePreview: () => ({ playing: false, position: 0, toggle: vi.fn() }),
}));
vi.mock("@/features/practice/hooks/useRecorder", () => ({
  useRecorder: () => ({
    rec: "preview",
    elapsed: 0,
    countBeat: 0,
    takeLen: 5,
    take,
    recordStartTime: 0,
    playing: false,
    playPos: 0,
    volume: 1,
    muted: false,
    rate: 1,
    reset,
    start: vi.fn(),
    stop: vi.fn(),
    togglePlay: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    setRate: vi.fn(),
  }),
}));
vi.mock("@/features/practice/hooks/useSegmentSubmit", () => ({ useSegmentSubmit: () => ({ send, uploading: false }) }));
vi.mock("@/features/practice/hooks/useResultPart", () => ({
  useResultPart: (_fetcher: unknown, _id: string, enabled: boolean) => ({
    data: enabled
      ? {
          submission: { status: "COMPLETED" },
          piece: { title: "Bài thử" },
          recording: { durationSec: 60 },
          audio: { teacherUrl: null },
          issues: [],
          tempo: null,
        }
      : null,
    loading: false,
    error: null,
  }),
}));
// Các thẻ dùng chung với luyện cả bài: chỉ cần biết chúng có mặt
vi.mock("@/features/practice/components/SheetPanel", () => ({ SheetPanel: () => <div>sheet-panel</div> }));
vi.mock("@/features/practice/components/TempoCard", () => ({ TempoCard: () => <div>tempo-card</div> }));
vi.mock("@/features/practice/components/TunerCard", () => ({ TunerCard: () => <div>tuner-card</div> }));
vi.mock("@/features/practice/components/ResultBanner", () => ({ ResultBanner: () => <div>result-banner</div> }));
vi.mock("@/features/practice/components/RecordPanel", () => ({
  RecordPanel: ({ onSend, sendLabel }: { onSend: () => void; sendLabel: string }) => (
    <button onClick={onSend}>{sendLabel}</button>
  ),
}));
vi.mock("@/features/practice/components/SegmentTimeline", () => ({
  SegmentTimeline: () => <div>segment-timeline</div>,
}));
vi.mock("@/features/practice/components/SegmentPickerSheet", () => ({ SegmentPickerSheet: () => null }));

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/practice/sheets/:sheetId/record" element={<RecordPage />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RecordPage chế độ đoạn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dùng chung layout với luyện cả bài, chỉ bỏ phần tải file", () => {
    renderAt("/practice/sheets/s1/record?of=sub1&start=10&end=20&countIn=0");
    expect(screen.getByText("Bài thử")).toBeTruthy();
    expect(screen.getByText("Đoạn 00:10 – 00:20")).toBeTruthy();
    // Cùng các thẻ của luyện cả bài
    expect(screen.getByText("sheet-panel")).toBeTruthy();
    expect(screen.getByText("tempo-card")).toBeTruthy();
    expect(screen.getByText("tuner-card")).toBeTruthy();
    expect(screen.getByText("result-banner")).toBeTruthy();
    // Thêm của chế độ đoạn
    expect(screen.getByText("segment-timeline")).toBeTruthy();
    expect(screen.getByText("Đổi đoạn")).toBeTruthy();
    // Bỏ của nộp cả bài
    expect(screen.queryByText("Tải file lên")).toBeNull();
    expect(screen.queryByText(/Định dạng MP3/)).toBeNull();
  });

  it("không có `of` ⇒ chế độ cả bài như cũ", () => {
    renderAt("/practice/sheets/s1/record");
    expect(screen.getByText("Tải file lên")).toBeTruthy();
    expect(screen.queryByText("Đổi đoạn")).toBeNull();
    expect(screen.queryByText("segment-timeline")).toBeNull();
    expect(screen.getByText("Gửi")).toBeTruthy();
  });

  it("gửi thành công ⇒ sang màn Chờ của lượt luyện đoạn", async () => {
    send.mockResolvedValue({ id: "att9" });
    renderAt("/practice/sheets/s1/record?of=sub1&start=10&end=20&countIn=0");
    fireEvent.click(screen.getByText("Gửi phân tích"));
    await waitFor(() =>
      expect(screen.getByTestId("where").textContent).toBe("/practice/submissions/sub1/processing?attempt=att9")
    );
    expect(send).toHaveBeenCalledWith(take.file, { start: 10, end: 20 });
    expect(reset).toHaveBeenCalled();
  });

  it("gửi thất bại ⇒ ở lại màn ghi âm, giữ bản thu", async () => {
    send.mockResolvedValue(null);
    renderAt("/practice/sheets/s1/record?of=sub1&start=10&end=20&countIn=0");
    fireEvent.click(screen.getByText("Gửi phân tích"));
    await waitFor(() => expect(send).toHaveBeenCalled());
    expect(reset).not.toHaveBeenCalled();
    expect(screen.queryByTestId("where")).toBeNull();
  });

  it("có `of` nhưng đoạn sai ⇒ toast và về kết quả", async () => {
    renderAt("/practice/sheets/s1/record?of=sub1&start=20&end=10");
    await waitFor(() => expect(screen.getByTestId("where").textContent).toBe("/practice/submissions/sub1"));
    expect(toast.error).toHaveBeenCalledWith(MSG.segmentInvalid);
  });
});
