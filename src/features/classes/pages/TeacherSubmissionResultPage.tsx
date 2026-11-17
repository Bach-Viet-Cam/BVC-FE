import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FloatingCommentPanel } from "@/features/classes/components/FloatingCommentPanel";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { useCommentHandler } from "@/features/classes/hooks/useCommentHandler";
import { buildStudentStatsPath } from "@/features/classes/utils/studentStatsFormat";
import {
  SUBMISSION_STATUS_LABELS,
  formatVietnamDateTime,
} from "@/features/classes/utils/teacherAssignmentFormat";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import { ResultCardsGrid } from "@/features/practice/components/ResultCardsGrid";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import type { PracticeResult } from "@/features/practice/types/practiceResultTypes";
import { AuthenticatedAudio } from "@/shared/components/bvc/AuthenticatedAudio";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

const CARD = "rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5";

// Giảng viên xem kết quả một lần nộp của sinh viên (cùng các thẻ như trang Kết quả của sinh viên,
// không có xếp hạng lớp / luyện đoạn) và nhận xét trong khung nổi.
export function TeacherSubmissionResultPage() {
  const navigate = useNavigate();
  const { classId = "", studentId = "", submissionId = "" } = useParams();
  const statsPath = buildStudentStatsPath(classId, studentId);
  const location = useLocation();
  const backPath = (location.state as { from?: string } | null)?.from ?? statsPath;

  const result = useResultPart(practiceResultApi.getResult, submissionId, true, MSG.resultLoadFailed);
  // Giữ kết quả lần trước trong lúc tải lại sau khi lưu nhận xét, để khung nhận xét không bị gỡ (mất chữ đang gõ)
  const [shown, setShown] = useState<PracticeResult | null>(null);
  if (result.data && result.data !== shown) setShown(result.data);
  const data = shown?.submission.id === submissionId ? shown : null;
  const isCompleted = data?.submission.status === "COMPLETED";
  const history = useResultPart(practiceResultApi.getHistory, submissionId, isCompleted, MSG.resultPartFailed);
  const chart = useResultPart(practiceResultApi.getPitchChart, submissionId, isCompleted, MSG.pitchUnavailable);
  const handleSaveComment = useCommentHandler(result.reload);

  const review = data?.lecturerReview;
  // Số lần nộp theo cách đếm của trang thống kê (mọi lần nộp, kể cả lần lỗi)
  const attemptLabel = review && review.attemptNo > 0 ? `Lần ${review.attemptNo}` : "Bài nộp";
  // Quay về đúng mục lịch sử đã mở trang này (giữ đích quay lại của trang thống kê); mở trực tiếp thì về trang thống kê
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate(backPath));
  const subtitle = data
    ? [
        data.assignment?.title ?? data.piece.title,
        review && review.attemptNo > 0 ? attemptLabel : null,
        formatVietnamDateTime(data.submission.submittedAt),
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={review?.student.fullName ?? "Kết quả bài nộp"}
        subtitle={subtitle}
        onBack={goBack}
      />
      {/* Chừa chỗ cho khung nhận xét nổi ở đáy màn hình */}
      <div className="flex flex-col px-[4px] pb-[120px] md:px-[18px] lg:px-[32px]">
        {!data && result.loading && (
          <div className="mx-3.5 mt-6 h-64 animate-pulse rounded-bvc-xl bg-bvc-surface md:mx-0" aria-label="Đang tải" />
        )}
        {!data && !result.loading && result.error && (
          <div className={`${CARD} mx-3.5 mt-6 flex flex-col items-center gap-3 text-center md:mx-0`}>
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

        {data && isCompleted && (
          <ResultCardsGrid
            submissionId={submissionId}
            data={data}
            chart={chart}
            history={history}
            showSegments={false}
          />
        )}
        {data && !isCompleted && (
          <div className={`${CARD} mx-3.5 mt-6 flex flex-col gap-3 md:mx-0`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-bvc-ink">Bài nộp chưa có kết quả phân tích</span>
              <StatusLabel
                label={SUBMISSION_STATUS_LABELS[data.submission.status]}
                tone={data.submission.status === "PROCESSING" ? "muted" : "warn"}
              />
            </div>
            <AuthenticatedAudio endpoint={`/submissions/${submissionId}/audio`} />
          </div>
        )}
      </div>

      {data && review && (
        <FloatingCommentPanel
          key={submissionId}
          submissionLabel={attemptLabel}
          comment={review.comment}
          canComment={review.canComment}
          onSave={handleSaveComment(submissionId)}
        />
      )}
    </TeacherScreen>
  );
}
