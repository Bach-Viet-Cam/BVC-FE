import { AiFeedbackRating } from "@/features/platform/components/AiFeedbackRating";
import { SubmissionSharing } from "@/features/community/components/SubmissionVerification";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { RotateCw } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { AiFeedbackCard } from "@/features/practice/components/AiFeedbackCard";
import { ClassRankCard } from "@/features/practice/components/ClassRankCard";
import { PitchContourCard } from "@/features/practice/components/PitchContourCard";
import { PracticeModeSheet } from "@/features/practice/components/PracticeModeSheet";
import { PracticeTitleRow } from "@/features/practice/components/PracticeTitleRow";
import { ResultAudioPlayers } from "@/features/practice/components/ResultAudioPlayers";
import { ResultBanner } from "@/features/practice/components/ResultBanner";
import { ProgressHistoryCard } from "@/features/practice/components/ProgressHistoryCard";
import { ResultOverviewCard } from "@/features/practice/components/ResultOverviewCard";
import { SegmentAttemptsCard } from "@/features/practice/components/SegmentAttemptsCard";
import { SegmentPickerSheet } from "@/features/practice/components/SegmentPickerSheet";
import { ComparisonLines } from "@/features/practice/components/SegmentResultCard";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import type { ResultPartState } from "@/features/practice/hooks/useResultPart";
import { useSegmentAttempt } from "@/features/practice/hooks/useSegmentAttempt";
import type { PracticeSegment } from "@/features/practice/components/SegmentPickerSheet";
import type { PitchChart, PracticeResult } from "@/features/practice/types/practiceResultTypes";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { formatDurationLabel } from "@/features/practice/utils/resultFormat";
import {
  buildAttemptProcessingPath,
  buildSegmentRecordPath,
  parseAttemptId,
} from "@/features/practice/utils/segmentFormat";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { toast } from "@/shared/components/ui/toast";

type OpenSheet = "mode" | "segment" | null;

const CARD = "rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-bvc-xl md:p-5.5";

// M01 Kết quả phân tích. Mỗi thẻ tải từ API riêng: lỗi một phần chỉ ảnh hưởng thẻ đó.
// Bài chưa phân tích xong (đang xử lý, bị từ chối, lỗi) được chuyển sang màn tiến trình.
// Có ?attempt=<id>: chế độ "đoạn" - hiện kết quả một lượt luyện đoạn của bản nộp gốc (:submissionId).
export function ResultsPage() {
  const navigate = useNavigate();
  const { submissionId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = parseAttemptId(searchParams);
  const segmentMode = attemptId !== null;
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const result = useResultPart(practiceResultApi.getResult, submissionId, true, MSG.resultLoadFailed);
  const data = result.data;
  const isCompleted = data?.submission.status === "COMPLETED";
  // Chế độ đoạn không hiện lịch sử / xếp hạng lớp nên không tải
  const history = useResultPart(
    practiceResultApi.getHistory,
    submissionId,
    isCompleted && !segmentMode,
    MSG.resultPartFailed
  );
  const classRank = useResultPart(
    practiceResultApi.getClassRank,
    submissionId,
    isCompleted && !segmentMode && Boolean(data?.assignment),
    MSG.resultPartFailed
  );
  // Biểu đồ bản gốc: chế độ đoạn vẫn cần cho SegmentPickerSheet (độ dài, vùng lỗi)
  const chart = useResultPart(practiceResultApi.getPitchChart, submissionId, isCompleted, MSG.pitchUnavailable);
  const { attempt, error: attemptError } = useSegmentAttempt(attemptId);
  const hasSegmentScores = attempt?.status === "COMPLETED" && attempt.scores?.overall != null;
  const segmentChart = useResultPart(
    practiceSegmentApi.getPitchChart,
    attemptId ?? "",
    hasSegmentScores,
    MSG.pitchUnavailable
  );

  useEffect(() => {
    if (data && !isCompleted)
      navigate(`/practice/submissions/${encodeURIComponent(submissionId)}/processing`, { replace: true });
  }, [data, isCompleted, navigate, submissionId]);

  // Lượt luyện đoạn còn đang xử lý thì về màn Chờ của chính lượt đó
  useEffect(() => {
    if (attemptId && attempt?.status === "PROCESSING")
      navigate(buildAttemptProcessingPath(submissionId, attemptId), { replace: true });
  }, [attempt?.status, attemptId, navigate, submissionId]);

  function startPractice() {
    setSheet(null);
    if (data?.sheetMusic) navigate(`/practice/sheets/${data.sheetMusic.id}/record`);
    else navigate(-1);
  }

  // UC-03: luyện riêng đoạn đã chọn, không tạo bản nộp mới
  function startSegment(segment: PracticeSegment) {
    setSheet(null);
    if (!data?.sheetMusic) {
      toast.error(MSG.segmentInvalid);
      return;
    }
    navigate(buildSegmentRecordPath(data.sheetMusic.id, submissionId, segment));
  }

  const retakeSegment = attempt
    ? {
        label: `Thu lại đoạn này (${fmtTime(attempt.startSec)} - ${fmtTime(attempt.endSec)})`,
        onSelect: () => startSegment({ start: attempt.startSec, end: attempt.endSec, countIn: false }),
      }
    : undefined;

  const durationSec = data?.recording.durationSec ?? chart.data?.durationSec ?? null;
  let subtitle = "";
  if (data && isCompleted) {
    if (!segmentMode) subtitle = subtitleOf(data, durationSec);
    else if (attempt) subtitle = `${data.piece.title} · đoạn ${fmtTime(attempt.startSec)} – ${fmtTime(attempt.endSec)}`;
  }

  return (
    <StudentShell>
      <ResultBanner className="fixed inset-x-3.5 top-3 md:inset-x-auto md:top-24 md:right-8 md:w-96" />
      <div className="mx-auto flex w-full flex-1 flex-col md:max-w-180 md:px-14 md:pt-6 lg:max-w-300">
        <PracticeTitleRow title={segmentMode ? "Kết quả đoạn" : "Kết quả phân tích"} subtitle={subtitle} />

        {result.loading && <ResultSkeleton />}
        {!result.loading && result.error && (
          <div className={`${CARD} mx-3.5 mt-3.5 flex flex-col items-center gap-3 text-center md:mx-0 md:mt-6`}>
            <p className="text-[13px] text-bvc-muted">{result.error}</p>
            <button
              type="button"
              onClick={result.reload}
              className="min-h-11 cursor-pointer rounded-full border border-bvc-border px-4 text-sm font-medium text-bvc-ink"
            >
              Thử lại
            </button>
          </div>
        )}

        {data && isCompleted && segmentMode && (
          <SegmentBody attempt={attempt} error={attemptError} chart={segmentChart} />
        )}
        {data && isCompleted && !segmentMode && (
          <div className="px-3.5 pt-3.5 md:px-0 md:pt-6">
            <SubmissionSharing key={submissionId} submissionId={submissionId} showAudio={false} />
          </div>
        )}
        {data && isCompleted && !segmentMode && data.scores && (
          // Dưới lg: một cột (điểm, AI, biểu đồ, vị trí, tiến trình). Từ lg: điểm bên trái, AI bên phải;
          // biểu đồ cao độ trải hết bề ngang ở hàng 2; nghe lại GV + sinh viên ngay dưới biểu đồ; vị trí + tiến trình ở hàng dưới
          <div className="flex flex-col gap-3.5 px-3.5 pt-3.5 pb-4 md:px-0 md:pt-6 lg:grid lg:grid-cols-12 lg:content-start lg:gap-5">
            <div
              className={`*:h-full lg:row-start-1 ${data.aiFeedback ? "lg:col-span-5 lg:col-start-1" : "lg:col-span-12"}`}
            >
              <ResultOverviewCard scores={data.scores} />
            </div>
            {data.aiFeedback && (
              <div className="*:h-full lg:col-span-7 lg:col-start-6 lg:row-start-1">
                <AiFeedbackCard feedback={data.aiFeedback} warnings={data.qualityWarnings} />
              </div>
            )}
            <div className="lg:col-span-12 lg:row-start-2">
              <PitchContourCard chart={chart.data} loading={chart.loading} error={chart.error} />
            </div>
            <div className="lg:col-span-12 lg:row-start-3">
              <ResultAudioPlayers submissionId={submissionId} teacherUrl={data.audio.teacherUrl} />
            </div>
            {/* Chỉ bài nộp thuộc bài tập của lớp mới có vị trí trong lớp; BE trả null khi lớp quá ít bạn để ẩn danh */}
            {classRank.data && (
              <div className="*:h-full lg:col-span-6 lg:col-start-1 lg:row-start-4">
                <ClassRankCard rank={classRank.data} />
              </div>
            )}
            {history.data && history.data.attempts.length > 0 && (
              <div
                className={`*:h-full lg:col-span-6 lg:row-start-4 ${classRank.data ? "lg:col-start-7" : "lg:col-start-1"}`}
              >
                <ProgressHistoryCard history={history.data} />
              </div>
            )}
            <div className="empty:hidden lg:col-span-12 lg:row-start-5">
              <SegmentAttemptsCard submissionId={submissionId} />
            </div>
          </div>
        )}
      </div>

      {data && isCompleted && !segmentMode && data.aiFeedback && !data.aiFeedback.isFallback && (
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-14">
          <AiFeedbackRating
            key={submissionId}
            submissionId={submissionId}
            presentation="dialog"
            expectedFeedback={data.aiFeedback.text}
            onReloadFeedback={result.reload}
          />
        </div>
      )}
      {data && isCompleted && (
        <>
          <footer className="sticky bottom-0 z-10 mt-auto shrink-0 border-t border-bvc-border bg-white/95 px-4 py-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setSheet("mode")}
              className="mx-auto flex min-h-13 w-full max-w-180 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-bvc-ink text-base font-semibold text-white lg:max-w-300"
            >
              <RotateCw className="size-5" strokeWidth={2.5} aria-hidden />
              Luyện tập lại
            </button>
          </footer>

          <PracticeModeSheet
            open={sheet === "mode"}
            onOpenChange={(open) => setSheet(open ? "mode" : null)}
            onFullSong={startPractice}
            retakeSegment={retakeSegment}
            onSegment={() => setSheet("segment")}
            pieceTitle={data.piece.title}
            durationLabel={durationSec === null ? null : formatDurationLabel(durationSec)}
          />
          {sheet === "segment" && (
            <SegmentPickerSheet
              open
              onOpenChange={(open) => setSheet(open ? "segment" : null)}
              onBack={() => setSheet("mode")}
              onStart={startSegment}
              durationSec={chart.data?.durationSec ?? durationSec ?? 0}
              issues={data.issues}
              chart={chart.data}
            />
          )}
        </>
      )}
    </StudentShell>
  );
}

function subtitleOf(result: PracticeResult, durationSec: number | null): string {
  const parts = [result.piece.title, `lần thu ${format(new Date(result.submission.submittedAt), "HH:mm")}`];
  if (durationSec !== null) parts.push(formatDurationLabel(durationSec));
  return parts.join(" · ");
}

interface SegmentBodyProps {
  attempt: SegmentAttempt | null;
  error: string;
  chart: ResultPartState<PitchChart>;
}

// Thân kết quả của một lượt luyện đoạn: so sánh, điểm, nhận xét AI, biểu đồ cao độ của đoạn
function SegmentBody({ attempt, error, chart }: SegmentBodyProps) {
  const wrap = "flex flex-col gap-3.5 px-3.5 pt-3.5 pb-4 md:px-0 md:pt-6";
  if (!attempt) {
    return error ? <p className={`${wrap} text-[13px] text-bvc-muted`}>{error}</p> : <ResultSkeleton />;
  }
  if (attempt.status === "REJECTED" || attempt.status === "FAILED") {
    return (
      <div className={wrap}>
        <div className={`${CARD} flex flex-col gap-1.5`} role="alert">
          <p className="text-[13.5px] text-bvc-accent-text">{attempt.error?.message || MSG.failed}</p>
          <p className="text-[13px] text-bvc-muted">{MSG.segmentKeepOld}.</p>
        </div>
      </div>
    );
  }
  if (attempt.status !== "COMPLETED") return null; // PROCESSING: đang chuyển sang màn Chờ
  const scores = attempt.scores;
  if (!scores || scores.overall === null || scores.pitch === null || scores.rhythm === null) {
    return (
      <div className={wrap}>
        <p className={`${CARD} text-[13.5px] text-bvc-muted`}>{MSG.segmentNoNotes}</p>
      </div>
    );
  }
  return (
    <div className={`${wrap} lg:grid lg:grid-cols-12 lg:content-start lg:gap-5`}>
      <div className="lg:col-span-12 empty:hidden">
        <ComparisonLines attempt={attempt} />
      </div>
      <div className={`*:h-full ${attempt.aiFeedback ? "lg:col-span-5" : "lg:col-span-12"}`}>
        <ResultOverviewCard
          scores={{ overall: scores.overall, pitch: scores.pitch, rhythm: scores.rhythm, tempo: null }}
        />
      </div>
      {attempt.aiFeedback && (
        <div className="*:h-full lg:col-span-7">
          <AiFeedbackCard feedback={attempt.aiFeedback} warnings={[]} />
        </div>
      )}
      <div className="lg:col-span-12">
        <PitchContourCard chart={chart.data} loading={chart.loading} error={chart.error} />
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div
      className="flex flex-col gap-3.5 px-3.5 pt-3.5 md:px-0 md:pt-6 lg:grid lg:grid-cols-12 lg:gap-5"
      aria-label="Đang tải kết quả"
    >
      <div className="h-32 animate-pulse rounded-bvc-xl bg-bvc-surface lg:col-span-5" />
      <div className="h-64 animate-pulse rounded-bvc-xl bg-bvc-surface lg:col-span-7" />
    </div>
  );
}
