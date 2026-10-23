import { useState } from "react";
import { RotateCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { practiceSubmissionApi } from "@/features/practice/api/practiceSubmissionApi";
import { AiFeedbackCard } from "@/features/practice/components/AiFeedbackCard";
import { ClassRankCard } from "@/features/practice/components/ClassRankCard";
import { PitchContourCard } from "@/features/practice/components/PitchContourCard";
import { PracticeModeSheet } from "@/features/practice/components/PracticeModeSheet";
import { PracticeTitleRow } from "@/features/practice/components/PracticeTitleRow";
import { ResultBanner } from "@/features/practice/components/ResultBanner";
import { ProgressHistoryCard } from "@/features/practice/components/ProgressHistoryCard";
import { ResultOverviewCard } from "@/features/practice/components/ResultOverviewCard";
import { SegmentPickerSheet } from "@/features/practice/components/SegmentPickerSheet";
import { RESULT_MOCK } from "@/features/practice/constants/resultsMockData";
import { StudentShell } from "@/shared/components/bvc/StudentShell";

type OpenSheet = "mode" | "segment" | null;

// M01 Kết quả phân tích. Giao diện đã đủ theo thiết kế nhưng đang dùng dữ liệu mẫu (resultsMockData):
// BE mới trả trạng thái bài nộp, chưa trả điểm cao độ / nhịp / tempo, pitch contour, xếp hạng lớp, lịch sử lần nộp.
export function ResultsPage() {
  const navigate = useNavigate();
  const { submissionId = "" } = useParams();
  const [sheet, setSheet] = useState<OpenSheet>(null);

  // TODO(BE): truyền đoạn đã chọn (start/end bar, count-in) sang màn ghi âm khi hỗ trợ luyện theo đoạn
  async function startPractice() {
    setSheet(null);
    // Luyện lại cần sheet của bản nộp này; không lấy được thì quay về trang trước
    try {
      const { data } = await practiceSubmissionApi.get(submissionId);
      const sheetMusicId = data.data.sheetMusicId;
      if (sheetMusicId) navigate(`/practice/sheets/${sheetMusicId}/record`);
      else navigate(-1);
    } catch {
      navigate(-1);
    }
  }

  return (
    <StudentShell>
      <ResultBanner className="fixed inset-x-3.5 top-3 md:inset-x-auto md:top-24 md:right-8 md:w-96" />
      <div className="mx-auto flex w-full flex-1 flex-col md:max-w-180 md:px-14 md:pt-6 lg:max-w-300">
        <PracticeTitleRow
          title="Kết quả phân tích"
          subtitle={`${RESULT_MOCK.pieceTitle} · lần thu ${RESULT_MOCK.recordedAt} · ${RESULT_MOCK.durationLabel}`}
        />

        {/* Dưới lg: một cột (điểm, AI, pitch, vị trí, tiến trình). Từ lg: điểm + AI bên trái pitch, vị trí + tiến trình ở hàng dưới */}
        <div className="flex flex-col gap-3.5 px-3.5 pt-3.5 pb-4 md:px-0 md:pt-6 lg:grid lg:grid-cols-12 lg:content-start lg:gap-5">
          <div className="*:h-full lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <ResultOverviewCard />
          </div>
          <div className="*:h-full lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <AiFeedbackCard />
          </div>
          <div className="*:h-full lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <PitchContourCard />
          </div>
          <div className="*:h-full lg:col-span-6 lg:col-start-1 lg:row-start-3">
            <ClassRankCard />
          </div>
          <div className="*:h-full lg:col-span-6 lg:col-start-7 lg:row-start-3">
            <ProgressHistoryCard />
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 mt-auto shrink-0 border-t border-bvc-border bg-white/95 px-4 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setSheet("mode")}
          className="mx-auto flex min-h-13 w-full max-w-180 cursor-pointer items-center lg:max-w-300 justify-center gap-2 rounded-2xl bg-bvc-ink text-base font-bold text-white"
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
      />
      <SegmentPickerSheet
        open={sheet === "segment"}
        onOpenChange={(open) => setSheet(open ? "segment" : null)}
        onBack={() => setSheet("mode")}
        onStart={startPractice}
      />
    </StudentShell>
  );
}
