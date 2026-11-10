import { useEffect, useState } from "react";
import { SubmissionSharing } from "@/features/community/components/SubmissionVerification";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { StageTracker } from "@/features/practice/components/StageTracker";
import { MSG, RESULT_REDIRECT_MS } from "@/features/practice/constants/practiceConstants";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import { useSegmentAttempt } from "@/features/practice/hooks/useSegmentAttempt";
import { useSubmissionProgress } from "@/features/practice/hooks/useSubmissionProgress";
import { fmtTime, mbText } from "@/features/practice/utils/practiceFormat";
import { buildAttemptResultPath, buildSegmentRecordPath, parseAttemptId } from "@/features/practice/utils/segmentFormat";
import {
  isRetryExhausted,
  secondsUntil,
  toStageIndex,
  toStatusLabel,
} from "@/features/practice/utils/submissionStatus";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";

const PRIMARY_BUTTON =
  "flex min-h-13 w-full cursor-pointer items-center justify-center rounded-[15px] bg-bvc-ink text-[15px] font-medium text-white";
const WARN_BOX =
  "rounded-bvc-md border border-bvc-warn/50 bg-bvc-accent-tint px-3.5 py-3 text-[13px] leading-normal text-bvc-accent-text md:border-bvc-notice-border md:px-4.5 md:py-3.75 md:text-sm";

// Đếm ngược tới lúc nút "Thử lại" mở (GBR-59)
function useSecondsUntil(iso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [iso]);
  return secondsUntil(iso, now);
}

export function ProcessingPage() {
  const navigate = useNavigate();
  const { submissionId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = parseAttemptId(searchParams);
  const segmentMode = attemptId !== null;
  const { lastSubmitted } = usePracticeDemo();
  // Hai nguồn đều được gọi vô điều kiện; nguồn không dùng nhận id rỗng/null nên không gọi API
  const progress = useSubmissionProgress(segmentMode ? "" : submissionId);
  const segment = useSegmentAttempt(attemptId);
  // sheetId chỉ cần cho nút "Thu lại đoạn này" nên chỉ tải ở chế độ đoạn
  const original = useResultPart(practiceResultApi.getResult, submissionId, segmentMode, MSG.resultLoadFailed);
  const { paused, retrying, resume, retry } = progress;
  const attempt = segment.attempt;
  const submission = segmentMode ? null : progress.submission;
  const error = segmentMode ? segment.error : progress.error;
  // Cùng shape (status, stage) để dùng chung toStatusLabel / toStageIndex / StageTracker
  const current = segmentMode ? attempt : submission;
  const retrySec = useSecondsUntil(submission?.status === "FAILED" ? submission.retryAvailableAt : null);

  const status = current ? toStatusLabel(current.status) : null;
  const completed = current?.status === "COMPLETED";

  // GBR-52: vẫn ở màn tiến trình thì tự mở kết quả sau MSG-21
  useEffect(() => {
    if (!completed) return;
    const target = attemptId ? buildAttemptResultPath(submissionId, attemptId) : `/practice/submissions/${submissionId}`;
    const timer = setTimeout(() => navigate(target, { replace: segmentMode }), RESULT_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [completed, submissionId, attemptId, segmentMode, navigate]);

  if (!submissionId) {
    return (
      <PracticeFrame>
        <PracticeTopBar title="Tiến trình xử lý" subtitle="Chưa có bản nộp nào" />
        <p className="px-3.5 text-sm text-bvc-muted md:mx-auto md:w-full md:max-w-170 md:px-8 md:pt-8">
          {MSG.noSubmission}
        </p>
      </PracticeFrame>
    );
  }

  const localFile = !segmentMode && lastSubmitted?.submissionId === submissionId ? lastSubmitted.file : null;
  const exhausted = submission ? isRetryExhausted(submission) : false;
  const warnTone = current?.status === "REJECTED" || current?.status === "FAILED";
  const sheetId = original.data?.sheetMusic?.id ?? null;

  function recordSegmentAgain() {
    if (!attempt || !sheetId) return;
    navigate(buildSegmentRecordPath(sheetId, submissionId, { start: attempt.startSec, end: attempt.endSec, countIn: false }));
  }

  function recordAgain() {
    navigate(-1);
  }

  // GBR-60: tải bản thu về để nộp lại sau; bản trên máy chủ đã bị xóa (GBR-62)
  function downloadLocalFile() {
    if (!localFile) return;
    const url = URL.createObjectURL(localFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = localFile.name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(MSG.download);
  }

  return (
    <PracticeFrame>
      <PracticeTopBar
        title="Tiến trình xử lý"
        subtitle={
          attempt
            ? `Đoạn ${fmtTime(attempt.startSec)} – ${fmtTime(attempt.endSec)}`
            : "Hệ thống đang chấm bản thu của bạn"
        }
      />

      <div className="mx-auto w-full flex-1 overflow-y-auto px-3.5 pb-6 md:max-w-170 md:px-8 md:pt-8">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium",
              warnTone ? "bg-bvc-accent-tint text-bvc-accent-text" : "bg-bvc-surface text-bvc-ink"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                status === "Hoàn tất" ? "bg-bvc-ok" : warnTone ? "bg-bvc-warn" : "bg-bvc-accent"
              )}
            />
            {status ?? "Đang tải tiến trình..."}
          </span>
        </div>

        {localFile && (
          <p className="mt-2 text-[13px] text-bvc-muted">
            {localFile.name} · {mbText(localFile.size / (1024 * 1024))}
          </p>
        )}

        {current && (
          <div className="mt-3">
            <StageTracker stage={toStageIndex(current)} failed={warnTone} />
          </div>
        )}

        {error && <p className="mt-3 text-[13px] text-bvc-muted">{error}</p>}
        {submission && (submission.status === "FAILED" || submission.status === "REJECTED") && <div className="mt-4"><SubmissionSharing key={submissionId} submissionId={submissionId} /></div>}

        {current?.status === "PROCESSING" && (
          <p className="mt-3 text-[13px] leading-normal text-bvc-muted">{MSG.leaveHint}</p>
        )}

        {!segmentMode && paused && submission?.status !== "COMPLETED" && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-[13px] text-bvc-muted">{MSG.progressPaused}</p>
            <button type="button" onClick={resume} className={PRIMARY_BUTTON}>
              Kiểm tra lại
            </button>
          </div>
        )}

        {completed && (
          <p className="mt-3 rounded-bvc-md border border-bvc-border bg-bvc-surface px-3.5 py-3 text-[13px] text-bvc-ink md:bg-bvc-panel md:text-sm">
            {MSG.done}
          </p>
        )}

        {attempt && (attempt.status === "REJECTED" || attempt.status === "FAILED") && (
          <div className="mt-3 flex flex-col gap-3">
            <p className={WARN_BOX}>
              <span className="mb-1 block">{attempt.error?.message || MSG.failed}</span>
              {MSG.segmentKeepOld}
            </p>
            <button
              type="button"
              disabled={!sheetId}
              onClick={recordSegmentAgain}
              className={cn(PRIMARY_BUTTON, !sheetId && "cursor-not-allowed opacity-50")}
            >
              Thu lại đoạn này
            </button>
          </div>
        )}

        {submission?.status === "REJECTED" && (
          <div className="mt-3 flex flex-col gap-3">
            <p className={WARN_BOX}>{MSG.rejected(submission.rejectReason ?? "")}</p>
            <button type="button" onClick={recordAgain} className={PRIMARY_BUTTON}>
              Ghi âm lại
            </button>
          </div>
        )}

        {submission?.status === "FAILED" && !exhausted && (
          <div className="mt-3 flex flex-col gap-3">
            <p className={WARN_BOX}>
              {submission.errorMessage && <span className="mb-1 block">{submission.errorMessage}</span>}
              {MSG.failed}
              {retrySec > 0 && ` ${MSG.retryWait(retrySec)}`}
            </p>
            <p className="text-xs text-bvc-muted">
              Đã thử lại {submission.retryCount} / {submission.maxRetries} lần
            </p>
            <button
              type="button"
              disabled={retrySec > 0 || retrying}
              onClick={() => void retry()}
              className={cn(
                "flex min-h-13 w-full items-center justify-center rounded-[15px] text-[15px] font-medium",
                retrySec > 0 || retrying
                  ? "cursor-not-allowed border border-bvc-border bg-bvc-surface text-bvc-faint"
                  : "cursor-pointer bg-bvc-ink text-white"
              )}
            >
              {retrying ? "Đang gửi yêu cầu..." : "Thử lại"}
            </button>
          </div>
        )}

        {!segmentMode && exhausted && (
          <div className="mt-3 flex flex-col gap-3">
            <p className={WARN_BOX}>{MSG.exhausted}</p>
            {!localFile && <p className="text-xs text-bvc-muted">{MSG.noFileToDownload}</p>}
            <button
              type="button"
              disabled={!localFile}
              onClick={downloadLocalFile}
              className={cn(PRIMARY_BUTTON, !localFile && "cursor-not-allowed opacity-50")}
            >
              Tải file về
            </button>
          </div>
        )}
      </div>
    </PracticeFrame>
  );
}
