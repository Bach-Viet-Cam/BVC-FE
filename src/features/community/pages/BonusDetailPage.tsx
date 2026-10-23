import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Clock, Mic } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { useAssignmentDetail } from "@/features/classes/hooks/useAssignmentDetail";
import {
  SUBMIT_BLOCKED_MESSAGE,
  describeTimeLeft,
  formatFullDeadline,
} from "@/features/classes/utils/assignmentFormat";

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bvc-line/80 py-2.5 text-[13px] last:border-0">
      <span className="text-bvc-muted">{label}</span>
      <span className="text-right font-semibold text-bvc-ink">{value}</span>
    </div>
  );
}

export function BonusDetailPage() {
  const navigate = useNavigate();
  const { bonusId = "" } = useParams();
  const { assignment, error, isLoading } = useAssignmentDetail(bonusId);

  if (isLoading || !assignment) {
    return (
      <StudentShell>
        <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-4 px-3.5 py-4 sm:px-6 md:gap-6 md:px-10 md:py-8">
          <Link
            to="/community/bonus"
            className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-bvc-accent transition-colors hover:text-bvc-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại danh sách bài bonus</span>
          </Link>
          <div className="py-20 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2.5 text-bvc-muted">
                <span className="size-5 animate-spin rounded-full border-2 border-bvc-accent border-t-transparent" />
                <span className="text-[14px]">Đang tải chi tiết bài bonus...</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-bvc-border bg-bvc-surface/60 p-5 text-[14px] font-semibold text-bvc-error">
                {error}
              </div>
            )}
          </div>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-3.5 px-3.5 py-4 sm:px-6 md:gap-5 md:px-10 md:py-8">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/community/bonus"
            className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-bvc-accent transition-colors hover:text-bvc-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại danh sách bài bonus</span>
          </Link>
          <span className="text-[12.5px] font-semibold text-bvc-muted">
            {assignment.className}
          </span>
        </div>

        {/* Bố cục Responsive */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-3.5 lg:col-span-2 md:gap-4">
            <div className="rounded-2xl border border-bvc-border bg-white p-5 shadow-2xs md:p-6">
              {/* Eyebrow & Status Dot (NO PILLS) */}
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="font-bold text-bvc-ink">
                  {assignment.className} · Bonus
                </span>

                <div className="flex items-center gap-1.5 font-semibold text-[12px]">
                  {assignment.status === "OVERDUE" && (
                    <span className="flex items-center gap-1.5 text-bvc-error">
                      <span className="size-1.5 rounded-full bg-bvc-error" />
                      <span>Quá hạn</span>
                    </span>
                  )}
                  {assignment.status === "NOT_SUBMITTED" && (
                    <span className="flex items-center gap-1.5 text-bvc-muted font-medium">
                      <span className="size-1.5 rounded-full bg-bvc-faint" />
                      <span>Chưa nộp</span>
                    </span>
                  )}
                  {assignment.status === "SUBMITTED" && (
                    <span className="flex items-center gap-1.5 text-bvc-accent">
                      <span className="size-1.5 rounded-full bg-bvc-accent" />
                      <span>Đã nộp</span>
                    </span>
                  )}
                  {assignment.status === "PASSED" && (
                    <span className="flex items-center gap-1.5 text-bvc-ok">
                      <span className="size-1.5 rounded-full bg-bvc-ok" />
                      <span>Đạt</span>
                    </span>
                  )}
                </div>
              </div>

              <h1 className="mt-3 font-bvc-display text-[20px] font-black tracking-tight text-bvc-ink sm:text-[23px] md:text-[26px]">
                {assignment.title}
              </h1>

              {/* Banner thời hạn BVC */}
              <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-bvc-accent-border/70 bg-bvc-accent-tint/60 p-3 text-bvc-accent-text">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-bvc-accent-text" />
                  <span className="text-[12.5px] font-bold md:text-[13px]">
                    Hạn nộp: {formatFullDeadline(assignment.deadline)}
                  </span>
                </div>
                <span className="rounded-md bg-white/80 px-2 py-0.5 font-bvc-mono text-[11.5px] font-bold text-bvc-accent-text shadow-2xs">
                  {describeTimeLeft(assignment.deadline, new Date())}
                </span>
              </div>

              {assignment.description && (
                <div className="mt-4 border-t border-bvc-line pt-3">
                  <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-bvc-ink/80">
                    {assignment.description}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-bvc-border bg-white p-5 shadow-2xs">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-bvc-muted">Hình thức đánh giá</p>
              <p className="mt-2 text-[13px] leading-relaxed text-bvc-muted">
                Bài bonus là bài luyện thêm tự nguyện nhằm nâng cao kỹ năng diễn tấu. Bản thu của bạn sẽ được hệ thống AI phân tích độ chính xác và chuyển tới giảng viên bộ môn để lắng nghe, nhận xét và ghi nhận quá trình học tập.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-bvc-border bg-white p-5 shadow-2xs">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-bvc-muted">Thông tin bài bonus</p>

              <div className="mt-2.5 flex flex-col">
                <InfoRow label="Lớp học" value={assignment.className} />
                <InfoRow label="Accuracy tối thiểu" value={`${assignment.minAccuracy}%`} />
                <InfoRow label="Hạn nộp" value={formatFullDeadline(assignment.deadline)} />
                {assignment.targetBpm !== null && (
                  <InfoRow label="BPM yêu cầu" value={`${assignment.targetBpm} BPM`} />
                )}
                <InfoRow label="Lượt nộp" value={`${assignment.usedSubmissions} / ${assignment.maxSubmissions}`} />
              </div>

              <div className="mt-5 hidden lg:block">
                {!assignment.canSubmit && (
                  <p className="mb-2 text-center text-[12px] font-medium text-bvc-error">
                    {SUBMIT_BLOCKED_MESSAGE}
                  </p>
                )}
                <button
                  type="button"
                  disabled={!assignment.canSubmit}
                  onClick={() => navigate(`/community/bonus/${assignment.id}/submit`)}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-accent text-[14px] font-bold text-white shadow-sm transition-all hover:bg-bvc-ink active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Award size={16} />
                  <span>Bắt đầu làm bài &amp; Nộp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Button (< lg) */}
      <div className="sticky bottom-0 z-20 flex flex-col gap-2 border-t border-bvc-border bg-white/95 p-3.5 backdrop-blur-sm lg:hidden">
        {!assignment.canSubmit && (
          <p className="text-center text-[12px] font-medium text-bvc-error">{SUBMIT_BLOCKED_MESSAGE}</p>
        )}
        <button
          type="button"
          disabled={!assignment.canSubmit}
          onClick={() => navigate(`/community/bonus/${assignment.id}/submit`)}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-accent text-[14px] font-bold text-white shadow-sm transition-all hover:bg-bvc-ink active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Mic size={17} strokeWidth={2.2} />
          <span>Bắt đầu làm bài &amp; Nộp</span>
        </button>
      </div>
    </StudentShell>
  );
}
