import { useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { verifiedApi } from "@/features/community/api/verifiedApi";
import type { ReviewState } from "@/features/community/types/verifiedTypes";
import { VerificationSeal } from "@/features/community/components/VerificationSeal";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { AuthenticatedAudio } from "@/shared/components/bvc/AuthenticatedAudio";

interface SubmissionVerificationProps {
  studentName?: string;
  targetName?: string;
  submissionId: string;
  submissionLabel?: string;
  manual?: boolean;
}

export function SubmissionVerification({
  submissionId,
  submissionLabel = "Bản thu đang chọn",
  manual = false,
  studentName,
  targetName,
}: SubmissionVerificationProps) {
  const state = useAsyncData(() => verifiedApi.review(submissionId), `review:${submissionId}`);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<ReviewState | null>(null);
  const [manualChecked, setManualChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);
  const current = outcome ?? state.data;
  const review = current?.review;
  const approved = review?.status === "APPROVED";
  const disabled = state.isLoading || Boolean(state.data && !state.data.canReview && !state.data.review);

  function openReview() {
    setOutcome(null);
    setError(null);
    setManualChecked(false);
    setOpen(true);
    state.reload();
  }

  async function confirm() {
    if (saving.current || state.isLoading || !state.data?.canReview || (manual && !manualChecked)) return;
    saving.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await verifiedApi.decide(submissionId, "APPROVE", undefined, manual);
      setOutcome(result);
      state.mutate(() => result);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  return (
    <>
      {approved ? (
        <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-bvc-ink">
            <BadgeCheck size={16} className="text-bvc-accent" aria-hidden />
            Giảng viên đã xác minh
          </span>
          <button
            type="button"
            onClick={openReview}
            className="min-h-11 text-[13px] text-bvc-muted underline underline-offset-4 hover:text-bvc-ink"
          >
            Chi tiết
          </button>
        </div>
      ) : (
        <ActionButton
          variant="secondary"
          onClick={openReview}
          disabled={disabled}
          className="min-h-11 gap-2 px-3 text-[13px]"
        >
          <BadgeCheck size={16} aria-hidden />
          {review ? "Xem kết quả" : "Xác minh bản thu"}
        </ActionButton>
      )}
      <FormDialog
        open={open}
        onClose={() => {
          if (!saving.current) setOpen(false);
        }}
        title={review ? (approved ? "Đã xác minh" : "Kết quả xác minh") : "Xác minh bản thu"}
        description={submissionLabel}
      >
        <div aria-busy={pending} className="flex flex-col gap-5 px-6 pt-2 pb-6 sm:px-[30px]">
          {(studentName || targetName) && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {studentName && (
                <>
                  <dt className="text-bvc-muted">Sinh viên</dt>
                  <dd className="font-medium break-words">{studentName}</dd>
                </>
              )}
              {targetName && (
                <>
                  <dt className="text-bvc-muted">Bài nhạc</dt>
                  <dd className="font-medium break-words">{targetName}</dd>
                </>
              )}
            </dl>
          )}

          {state.isLoading && !outcome ? (
            <p role="status" className="py-4 text-sm text-bvc-muted">
              Đang tải...
            </p>
          ) : state.error && !outcome ? (
            <div className="flex flex-col items-start gap-3" role="alert">
              <p className="text-sm text-bvc-accent-text">{state.error}</p>
              <ActionButton variant="secondary" onClick={state.reload}>
                Thử lại
              </ActionButton>
            </div>
          ) : review ? (
            <>
              {approved ? (
                <div
                  key={outcome ? "saved" : "existing"}
                  className="flex flex-col items-center gap-2 py-1"
                  role="status"
                  aria-label="Bản thu đã được xác minh"
                >
                  <VerificationSeal status="approved" animate={Boolean(outcome)} />
                  {!current?.shareConsent && <p className="text-sm text-bvc-muted">Bản thu được giữ ẩn.</p>}
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-bvc-muted">
                  {review.reason || "Bản thu chưa được xác minh."}
                </p>
              )}
              <ActionButton onClick={() => setOpen(false)}>Đóng</ActionButton>
            </>
          ) : !current?.canReview ? (
            <p className="py-3 text-sm text-bvc-muted">Chưa thể xác minh bản thu này.</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <VerificationSeal status="ready" />
                <p className="text-sm leading-relaxed text-bvc-ink">
                  {current.shareConsent
                    ? "Thêm bản thu vào bài nhạc dưới dạng bản phụ đã xác minh?"
                    : "Sinh viên chưa đồng ý chia sẻ. Bản thu sẽ được giữ ẩn."}
                </p>
              </div>
              {manual && (
                <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-bvc-ink">
                  <input
                    type="checkbox"
                    className="mt-1 size-5 shrink-0 accent-bvc-ink"
                    checked={manualChecked}
                    disabled={pending}
                    onChange={(event) => setManualChecked(event.target.checked)}
                  />
                  <span>Đã nghe và kiểm tra thủ công (chưa có kết quả AI).</span>
                </label>
              )}
              {error && (
                <p role="alert" className="text-sm text-bvc-accent-text">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <ActionButton variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
                  Hủy
                </ActionButton>
                <ActionButton isLoading={pending} disabled={manual && !manualChecked} onClick={() => void confirm()}>
                  Xác minh
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </FormDialog>
    </>
  );
}

export function SubmissionSharing({ submissionId, showAudio = true }: { submissionId: string; showAudio?: boolean }) {
  const state = useAsyncData(() => verifiedApi.review(submissionId), `sharing:${submissionId}`);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function change(isGranted: boolean) {
    setPending(true);
    setError(null);
    try {
      await verifiedApi.consent(submissionId, isGranted);
      state.reload();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <section aria-label="Quyền chia sẻ bản thu" className="rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5">
      <h2 className="text-[17px] font-semibold">Bản thu của bạn</h2>
      {showAudio ? (
        <div className="my-3">
          <AuthenticatedAudio
            key={submissionId}
            endpoint={`/submissions/${submissionId}/audio`}
            label="Nghe lại bản thu"
          />
        </div>
      ) : (
        <div className="my-3" />
      )}
      {state.error ? (
        <div role="alert">
          <p className="text-sm text-bvc-accent-text">{state.error}</p>
          <ActionButton variant="secondary" onClick={state.reload}>
            Thử lại
          </ActionButton>
        </div>
      ) : (
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-1 size-5 shrink-0 accent-bvc-ink"
            disabled={pending || state.isLoading || !state.data}
            checked={state.data?.shareConsent ?? false}
            onChange={(event) => void change(event.target.checked)}
          />
          <span>
            Tôi đồng ý chia sẻ bản thu sau khi được giảng viên xác minh.
            <span className="mt-1 block text-bvc-muted">
              Người học các khóa khác có thể nghe bản thu tại bài nhạc. Bạn có thể rút đồng ý bất cứ lúc nào.
            </span>
          </span>
        </label>
      )}
      {state.data?.review && (
        <p className="mt-3 text-sm text-bvc-muted">
          {state.data.review.status === "APPROVED"
            ? "Giảng viên đã xác minh bản thu."
            : `Giảng viên từ chối: ${state.data.review.reason ?? ""}`}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-bvc-accent-text">
          {error}
        </p>
      )}
    </section>
  );
}
