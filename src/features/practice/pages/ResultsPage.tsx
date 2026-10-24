import { useEffect, useState } from "react";
import { format } from "date-fns";
import { RotateCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import { AiFeedbackCard } from "@/features/practice/components/AiFeedbackCard";
import { ClassRankCard } from "@/features/practice/components/ClassRankCard";
import { PitchContourCard } from "@/features/practice/components/PitchContourCard";
import { PracticeModeSheet } from "@/features/practice/components/PracticeModeSheet";
import { PracticeTitleRow } from "@/features/practice/components/PracticeTitleRow";
import { ResultBanner } from "@/features/practice/components/ResultBanner";
import { ProgressHistoryCard } from "@/features/practice/components/ProgressHistoryCard";
import { ResultOverviewCard } from "@/features/practice/components/ResultOverviewCard";
import { SegmentPickerSheet } from "@/features/practice/components/SegmentPickerSheet";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import type { PracticeResult } from "@/features/practice/types/practiceResultTypes";
import { formatDurationLabel } from "@/features/practice/utils/resultFormat";
import { StudentShell } from "@/shared/components/bvc/StudentShell";

type OpenSheet = "mode" | "segment" | null;

const CARD = "rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5";

// M01 Kết quả phân tích. Mỗi thẻ tải từ API riêng: lỗi một phần chỉ ảnh hưởng thẻ đó.
// Bài chưa phân tích xong (đang xử lý, bị từ chối, lỗi) được chuyển sang màn tiến trình.
export function ResultsPage() {
  const navigate = useNavigate();
  const { submissionId = "" } = useParams();
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const result = useResultPart(practiceResultApi.getResult, submissionId, true, MSG.resultLoadFailed);
  const data = result.data;
  const isCompleted = data?.submission.status === "COMPLETED";
  const history = useResultPart(practiceResultApi.getHistory, submissionId, isCompleted, MSG.resultPartFailed);
  const classRank = useResultPart(
    practiceResultApi.getClassRank,
    submissionId,
    isCompleted && Boolean(data?.assignment),
    MSG.resultPartFailed
  );
  const chart = useResultPart(practiceResultApi.getPitchChart, submissionId, isCompleted, MSG.pitchUnavailable);

  useEffect(() => {
    if (data && !isCompleted)
      navigate(`/practice/submissions/${encodeURIComponent(submissionId)}/processing`, { replace: true });
  }, [data, isCompleted, navigate, submissionId]);

  // TODO(BE): truyền đoạn đã chọn (start/end giây, count-in) sang màn ghi âm khi hỗ trợ luyện theo đoạn
  function startPractice() {
    setSheet(null);
    if (data?.sheetMusic) navigate(`/practice/sheets/${data.sheetMusic.id}/record`);
    else navigate(-1);
  }

  const durationSec = data?.recording.durationSec ?? chart.data?.durationSec ?? null;

  return (
    <StudentShell>
      <ResultBanner className="fixed inset-x-3.5 top-3 md:inset-x-auto md:top-24 md:right-8 md:w-96" />
      <div className="mx-auto flex w-full flex-1 flex-col md:max-w-180 md:px-14 md:pt-6 lg:max-w-300">
        <PracticeTitleRow
          title="Kết quả phân tích"
          subtitle={data && isCompleted ? subtitleOf(data, durationSec) : ""}
        />

        {result.loading && <ResultSkeleton />}
        {!result.loading && result.error && (
          <div className={`${CARD} mx-3.5 mt-3.5 flex flex-col items-center gap-3 text-center md:mx-0 md:mt-6`}>
            <p className="text-[13px] text-bvc-muted">{result.error}</p>
            <button
              type="button"
              onClick={result.reload}
              className="min-h-11 cursor-pointer rounded-xl border border-bvc-border px-4 text-sm font-semibold text-bvc-ink"
            >
              Thử lại
            </button>
          </div>
        )}

        {data && isCompleted && data.scores && (
          // Dưới lg: một cột (điểm, AI, biểu đồ, vị trí, tiến trình). Từ lg: điểm bên trái, AI bên phải;
          // biểu đồ cao độ trải hết bề ngang ở hàng 2; vị trí + tiến trình ở hàng dưới
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
            {/* Chỉ bài nộp thuộc bài tập của lớp mới có vị trí trong lớp; BE trả null khi lớp quá ít bạn để ẩn danh */}
            {classRank.data && (
              <div className="*:h-full lg:col-span-6 lg:col-start-1 lg:row-start-3">
                <ClassRankCard rank={classRank.data} />
              </div>
            )}
            {history.data && history.data.attempts.length > 0 && (
              <div
                className={`*:h-full lg:col-span-6 lg:row-start-3 ${classRank.data ? "lg:col-start-7" : "lg:col-start-1"}`}
              >
                <ProgressHistoryCard history={history.data} />
              </div>
            )}
          </div>
        )}
      </div>

      {data && isCompleted && (
        <>
          <footer className="sticky bottom-0 z-10 mt-auto shrink-0 border-t border-bvc-border bg-white/95 px-4 py-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setSheet("mode")}
              className="mx-auto flex min-h-13 w-full max-w-180 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-bvc-ink text-base font-bold text-white lg:max-w-300"
            >
              <RotateCw className="size-5" strokeWidth={2.5} aria-hidden />
              Luyện tập lại
            </button>
          </footer>

          <PracticeModeSheet
            open={sheet === "mode"}
            onOpenChange={(open) => setSheet(open ? "mode" : null)}
            onFullSong={startPractice}
            onSegment={() => setSheet("segment")}
            pieceTitle={data.piece.title}
            durationLabel={durationSec === null ? null : formatDurationLabel(durationSec)}
          />
          {sheet === "segment" && (
            <SegmentPickerSheet
              open
              onOpenChange={(open) => setSheet(open ? "segment" : null)}
              onBack={() => setSheet("mode")}
              onStart={startPractice}
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
