import { AiFeedbackCard } from "@/features/practice/components/AiFeedbackCard";
import { PitchContourCard } from "@/features/practice/components/PitchContourCard";
import { ResultOverviewCard } from "@/features/practice/components/ResultOverviewCard";
import { StageTracker } from "@/features/practice/components/StageTracker";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { formatScoreDelta } from "@/features/practice/utils/segmentFormat";
import { toStageIndex } from "@/features/practice/utils/submissionStatus";

interface SegmentResultCardProps {
  attempt: SegmentAttempt;
  onRetake: () => void;
}

const CARD = "flex flex-col gap-3.5 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5";

const scoreText = (score: number | null) => (score === null ? "—" : `${score}%`);

function ComparisonLines({ attempt }: { attempt: SegmentAttempt }) {
  const current = attempt.scores?.overall ?? null;
  const original = attempt.comparison.original?.overall ?? null;
  const previous = attempt.comparison.previous?.overall ?? null;
  const originalDelta = formatScoreDelta(original, current);
  const previousDelta = formatScoreDelta(previous, current);
  if (originalDelta === null && previousDelta === null) return null;
  return (
    <ul className="flex flex-col gap-1 text-[13.5px] text-bvc-ink">
      {originalDelta !== null && (
        <li>
          So với bản gốc: {scoreText(original)} → {scoreText(current)} ({originalDelta})
        </li>
      )}
      {previousDelta !== null && <li>So với lần trước: {previousDelta}</li>}
    </ul>
  );
}

// Kết quả của một lượt luyện đoạn, theo trạng thái (UC-03)
export function SegmentResultCard({ attempt, onRetake }: SegmentResultCardProps) {
  const isFinal = attempt.status !== "PROCESSING";
  const hasScores = attempt.status === "COMPLETED" && attempt.scores?.overall != null;
  const chart = useResultPart(practiceSegmentApi.getPitchChart, attempt.id, hasScores, MSG.pitchUnavailable);

  return (
    <section className={CARD} aria-live="polite">
      <h2 className="text-[15px] font-semibold text-bvc-ink">
        Kết quả đoạn {fmtTime(attempt.startSec)} – {fmtTime(attempt.endSec)}
      </h2>

      {attempt.status === "PROCESSING" && <StageTracker stage={toStageIndex(attempt)} failed={false} />}

      {attempt.status === "COMPLETED" && attempt.scores && (
        <>
          {attempt.scores.overall === null || attempt.scores.pitch === null || attempt.scores.rhythm === null ? (
            <p className="text-[13.5px] text-bvc-muted">{MSG.segmentNoNotes}</p>
          ) : (
            <ResultOverviewCard
              scores={{
                overall: attempt.scores.overall,
                pitch: attempt.scores.pitch,
                rhythm: attempt.scores.rhythm,
                tempo: null,
              }}
            />
          )}
          <ComparisonLines attempt={attempt} />
          {attempt.aiFeedback && <AiFeedbackCard feedback={attempt.aiFeedback} warnings={[]} />}
          {hasScores && <PitchContourCard chart={chart.data} loading={chart.loading} error={chart.error} />}
        </>
      )}

      {attempt.status === "REJECTED" && (
        <p className="text-[13.5px] text-bvc-accent-text">{attempt.error?.message || MSG.failed}</p>
      )}

      {attempt.status === "FAILED" && (
        <p className="text-[13.5px] text-bvc-accent-text">
          {MSG.failed} {MSG.segmentKeepOld}.
        </p>
      )}

      {isFinal && (
        <button
          type="button"
          onClick={onRetake}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-bvc-ink text-[15px] font-medium text-white"
        >
          Thu lại đoạn này
        </button>
      )}
    </section>
  );
}
