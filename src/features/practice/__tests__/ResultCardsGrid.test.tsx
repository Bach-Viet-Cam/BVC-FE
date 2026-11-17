import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultCardsGrid } from "@/features/practice/components/ResultCardsGrid";
import type { ResultPartState } from "@/features/practice/hooks/useResultPart";
import type { ClassRank, PitchChart, PracticeResult } from "@/features/practice/types/practiceResultTypes";

vi.mock("@/features/practice/components/PitchContourCard", () => ({ PitchContourCard: () => <div>pitch</div> }));
vi.mock("@/features/practice/components/ResultAudioPlayers", () => ({ ResultAudioPlayers: () => <div>audio</div> }));
vi.mock("@/features/practice/components/SegmentAttemptsCard", () => ({
  SegmentAttemptsCard: () => <div>segment-attempts</div>,
}));
vi.mock("@/features/practice/components/ClassRankCard", () => ({ ClassRankCard: () => <div>class-rank</div> }));

const data = {
  submission: { id: "s1", status: "COMPLETED", submittedAt: "2026-11-01T00:00:00Z", analyzedAt: null, attemptNo: 1 },
  piece: { id: "p1", title: "Lý ngựa ô" },
  sheetMusic: null,
  assignment: { id: "a1", title: "Độc tấu", classId: "c1" },
  recording: { durationSec: 30 },
  scores: { overall: 80, pitch: 85, rhythm: 70, tempo: null },
  tempo: null,
  aiFeedback: null,
  issues: [],
  qualityWarnings: [],
  audio: { teacherUrl: null, studentUrl: null },
} as unknown as PracticeResult;

const part = <T,>(value: T | null): ResultPartState<T> => ({ data: value, loading: false, error: "", reload: vi.fn() });
const chart = part<PitchChart>(null);
const rank = part<ClassRank | null>({ className: "TRD301" } as ClassRank);

describe("ResultCardsGrid", () => {
  it("shows class rank and segment attempts for the student page", () => {
    render(<ResultCardsGrid submissionId="s1" data={data} chart={chart} classRank={rank} showSegments />);
    expect(screen.getByText("class-rank")).toBeInTheDocument();
    expect(screen.getByText("segment-attempts")).toBeInTheDocument();
  });

  it("leaves out class rank and segment attempts for the lecturer page", () => {
    render(<ResultCardsGrid submissionId="s1" data={data} chart={chart} showSegments={false} />);
    expect(screen.queryByText("class-rank")).not.toBeInTheDocument();
    expect(screen.queryByText("segment-attempts")).not.toBeInTheDocument();
    expect(screen.getByText("pitch")).toBeInTheDocument();
    expect(screen.getByText("audio")).toBeInTheDocument();
  });
});
