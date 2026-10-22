import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { StageTracker } from "@/features/practice/components/StageTracker";
import { DemoPanel } from "@/features/practice/components/DemoPanel";
import { MAX_RETRIES, MSG, SAMPLE } from "@/features/practice/constants/practiceConstants";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { fmtTime, mbText } from "@/features/practice/utils/practiceFormat";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";

export function ProcessingPage() {
  const navigate = useNavigate();
  const { songId } = useParams();
  const { submission, demo, retry, clearSubmission } = usePracticeDemo();
  const [retrySec, setRetrySec] = useState(0);

  const status = submission?.status;

  // GBR-52: mở kết quả 1.5 giây sau khi xong
  useEffect(() => {
    if (status !== "Hoàn tất") return;
    const timer = setTimeout(() => navigate(`/practice/${songId}/results`), 1500);
    return () => clearTimeout(timer);
  }, [status, navigate, songId]);

  // Minh hoạ xử lý nền: tự rời màn hình sau 1 giây
  useEffect(() => {
    if (!demo.leaveProc || status !== "Đang xử lý") return;
    const timer = setTimeout(() => navigate(`/practice/${songId}/record`), 1000);
    return () => clearTimeout(timer);
  }, [demo.leaveProc, status, navigate, songId]);

  useEffect(() => {
    if (status !== "Lỗi xử lý" || !submission) return;
    const timer = setInterval(() => {
      setRetrySec(Math.max(0, Math.ceil((submission.retryAt - Date.now()) / 1000)));
    }, 200);
    return () => clearInterval(timer);
  }, [status, submission]);

  if (!submission) {
    return (
      <PracticeFrame>
        <PracticeTopBar title={SAMPLE.piece} subtitle="Chưa có bản nộp nào" />
        <p className="px-3.5 text-sm text-bvc-muted md:mx-auto md:w-full md:max-w-170 md:px-8 md:pt-8">
          Bạn chưa gửi bản thu nào. Quay lại màn ghi âm để nộp bài.
        </p>
      </PracticeFrame>
    );
  }

  const { file, stage, reason, retriesUsed, exhausted } = submission;
  const warnTone = status === "Từ chối" || status === "Lỗi xử lý";

  return (
    <PracticeFrame>
      <PracticeTopBar
        title={SAMPLE.piece}
        subtitle={`${SAMPLE.className} · ${SAMPLE.instrument} · ${SAMPLE.lesson}`}
        rightSlot={<DemoPanel />}
      />

      <div className="mx-auto w-full flex-1 overflow-y-auto px-3.5 pb-6 md:max-w-170 md:px-8 md:pt-8">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold",
              warnTone ? "bg-bvc-accent-tint text-bvc-accent-text" : "bg-bvc-surface text-bvc-ink"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                status === "Hoàn tất" ? "bg-bvc-ok" : warnTone ? "bg-bvc-warn" : "bg-bvc-accent"
              )}
            />
            {status}
          </span>
        </div>

        <p className="mt-2 text-[13px] text-bvc-muted">
          {file.source === "record" ? "Bản thu" : file.name} · {mbText(file.mb)} · {fmtTime(file.dur)}
        </p>

        <div className="mt-3">
          <StageTracker stage={stage} failed={status === "Lỗi xử lý" || status === "Từ chối"} />
        </div>

        {status === "Đang xử lý" && (
          <p className="mt-3 text-[13px] leading-normal text-bvc-muted">
            Bạn có thể rời màn hình này. Hệ thống vẫn xử lý và sẽ báo khi có kết quả.
          </p>
        )}

        {status === "Hoàn tất" && (
          <p className="mt-3 rounded-bvc-md border border-bvc-border bg-bvc-surface px-3.5 py-3 text-[13px] text-bvc-ink md:bg-bvc-panel md:text-sm">
            Hoàn tất. Đang mở kết quả phân tích của bạn.
          </p>
        )}

        {status === "Từ chối" && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="rounded-bvc-md border border-bvc-warn/50 bg-bvc-accent-tint px-3.5 py-3 text-[13px] leading-normal text-bvc-accent-text md:border-bvc-notice-border md:px-4.5 md:py-3.75 md:text-sm">
              Bản thu không đạt chất lượng: {reason}. Lượt này không bị tính vào số lần nộp. Bạn có thể ghi âm hoặc tải
              file khác.
            </p>
            <button
              type="button"
              onClick={() => {
                clearSubmission();
                navigate(`/practice/${songId}/record`);
              }}
              className="flex min-h-13 w-full md:min-h-13 cursor-pointer items-center justify-center rounded-[15px] bg-bvc-ink text-[15px] font-semibold text-white"
            >
              Ghi âm lại
            </button>
          </div>
        )}

        {status === "Lỗi xử lý" && !exhausted && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="rounded-bvc-md border border-bvc-warn/50 bg-bvc-accent-tint px-3.5 py-3 text-[13px] leading-normal text-bvc-accent-text md:border-bvc-notice-border md:px-4.5 md:py-3.75 md:text-sm">
              Xử lý bản thu thất bại. File của bạn vẫn được giữ lại. Lượt này không bị tính vào số lần nộp.
              {retrySec > 0 && ` Bạn có thể thử lại sau ${retrySec} giây.`}
            </p>
            <p className="text-xs text-bvc-muted">
              Đã thử lại {retriesUsed} / {MAX_RETRIES} lần
            </p>
            <button
              type="button"
              disabled={retrySec > 0}
              onClick={retry}
              className={cn(
                "flex min-h-13 w-full md:min-h-13 items-center justify-center rounded-[15px] text-[15px] font-semibold",
                retrySec > 0
                  ? "cursor-not-allowed border border-bvc-border bg-bvc-surface text-bvc-faint"
                  : "cursor-pointer bg-bvc-ink text-white"
              )}
            >
              Thử lại
            </button>
          </div>
        )}

        {exhausted && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="rounded-bvc-md border border-bvc-warn/50 bg-bvc-accent-tint px-3.5 py-3 text-[13px] leading-normal text-bvc-accent-text md:border-bvc-notice-border md:px-4.5 md:py-3.75 md:text-sm">
              Hệ thống vẫn chưa xử lý được sau 3 lần thử lại. File phân tích của bạn đã bị xóa khỏi máy chủ. Bạn có thể
              tải bản thu về và nộp lại sau; bản nộp mới sẽ tính vào số lần nộp.
            </p>
            <button
              type="button"
              onClick={() => toast.success(MSG.download)}
              className="flex min-h-13 w-full md:min-h-13 cursor-pointer items-center justify-center rounded-[15px] bg-bvc-ink text-[15px] font-semibold text-white"
            >
              Tải file về
            </button>
          </div>
        )}
      </div>
    </PracticeFrame>
  );
}
