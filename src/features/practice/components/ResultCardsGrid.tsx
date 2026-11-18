import { AiFeedbackCard } from "@/features/practice/components/AiFeedbackCard";
import { ClassRankCard } from "@/features/practice/components/ClassRankCard";
import { PitchContourCard } from "@/features/practice/components/PitchContourCard";
import { ProgressHistoryCard } from "@/features/practice/components/ProgressHistoryCard";
import { ResultAudioPlayers } from "@/features/practice/components/ResultAudioPlayers";
import { ResultOverviewCard } from "@/features/practice/components/ResultOverviewCard";
import { SegmentAttemptsCard } from "@/features/practice/components/SegmentAttemptsCard";
import type { ResultPartState } from "@/features/practice/hooks/useResultPart";
import type { ClassRank, PitchChart, PracticeResult, ResultHistory } from "@/features/practice/types/practiceResultTypes";

interface ResultCardsGridProps {
  submissionId: string;
  // Bài nộp đã phân tích xong và có điểm
  data: PracticeResult;
  chart: ResultPartState<PitchChart>;
  history?: ResultPartState<ResultHistory>;
  // Chỉ trang của sinh viên: vị trí trong lớp
  classRank?: ResultPartState<ClassRank | null>;
  // Chỉ trang của sinh viên: các lượt luyện đoạn
  showSegments: boolean;
}

// Lưới thẻ kết quả dùng chung cho trang Kết quả của sinh viên và trang xem bài nộp của giảng viên.
// Dưới lg: một cột (điểm, AI, biểu đồ, vị trí, tiến trình). Từ lg: điểm bên trái, AI bên phải;
// biểu đồ cao độ trải hết bề ngang ở hàng 2; nghe lại GV + sinh viên ngay dưới biểu đồ; vị trí + tiến trình ở hàng dưới
export function ResultCardsGrid({ submissionId, data, chart, history, classRank, showSegments }: ResultCardsGridProps) {
  if (!data.scores) return null;
  const rank = classRank?.data ?? null;
  const historyData = history?.data ?? null;

  return (
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
      {rank && (
        <div className="*:h-full lg:col-span-6 lg:col-start-1 lg:row-start-4">
          <ClassRankCard rank={rank} />
        </div>
      )}
      {historyData && historyData.attempts.length > 0 && (
        <div className={`*:h-full lg:col-span-6 lg:row-start-4 ${rank ? "lg:col-start-7" : "lg:col-start-1"}`}>
          <ProgressHistoryCard history={historyData} />
        </div>
      )}
      {showSegments && (
        <div className="empty:hidden lg:col-span-12 lg:row-start-5">
          <SegmentAttemptsCard submissionId={submissionId} />
        </div>
      )}
    </div>
  );
}
