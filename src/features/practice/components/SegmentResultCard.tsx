import { IssueCard } from "@/features/practice/components/IssueCard";
import { StageTracker } from "@/features/practice/components/StageTracker";
import { MSG } from "@/features/practice/constants/practiceConstants";
import type { SegmentAttempt, SegmentScores } from "@/features/practice/types/practiceSegmentTypes";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { formatScoreDelta } from "@/features/practice/utils/segmentFormat";
import { toStageIndex } from "@/features/practice/utils/submissionStatus";

interface SegmentResultCardProps {
  attempt: SegmentAttempt;
  onRetake: () => void;
}

const CARD = "flex flex-col gap-3.5 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5";

const scoreText = (score: number | null) => (score === null ? "—" : `${score}%`);

function ScoreTiles({ scores }: { scores: SegmentScores }) {
  const tiles = [
    { label: "Tổng", value: scores.overall },
    { label: "Cao độ", value: scores.pitch },
    { label: "Nhịp", value: scores.rhythm },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col items-center gap-0.5 rounded-bvc-lg bg-bvc-surface py-3">
          <span className="text-xl font-semibold text-bvc-ink">{scoreText(tile.value)}</span>
          <span className="text-xs text-bvc-muted">{tile.label}</span>
        </div>
      ))}
    </div>
  );
}

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

  return (
    <section className={CARD} aria-live="polite">
      <h2 className="text-[15px] font-semibold text-bvc-ink">
        Kết quả đoạn {fmtTime(attempt.startSec)} – {fmtTime(attempt.endSec)}
      </h2>

      {attempt.status === "PROCESSING" && <StageTracker stage={toStageIndex(attempt)} failed={false} />}

      {attempt.status === "COMPLETED" && attempt.scores && (
        <>
          {attempt.scores.overall === null ? (
            <p className="text-[13.5px] text-bvc-muted">{MSG.segmentNoNotes}</p>
          ) : (
            <ScoreTiles scores={attempt.scores} />
          )}
          <ComparisonLines attempt={attempt} />
          {attempt.issues.length > 0 && (
            <div className="flex flex-col gap-2">
              {attempt.issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  rangeLabel={`${fmtTime(issue.startSec)}–${fmtTime(issue.endSec)}`}
                  title={issue.label}
                  description={issue.kind === "pitch" ? "Cao độ" : "Nhịp"}
                  onClick={() => undefined}
                />
              ))}
            </div>
          )}
          {attempt.aiFeedback && (
            <details className="rounded-bvc-lg border border-bvc-border px-3.5 py-3">
              <summary className="cursor-pointer text-sm font-medium text-bvc-ink">Nhận xét của AI</summary>
              <p className="mt-2 text-[13.5px] leading-normal text-bvc-muted">{attempt.aiFeedback.text}</p>
            </details>
          )}
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
