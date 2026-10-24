import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Mic,
  Music2,
  Target,
} from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { MySubmissionList } from "@/features/classes/components/MySubmissionList";
import { useAssignmentDetail } from "@/features/classes/hooks/useAssignmentDetail";
import {
  ASSIGNMENT_TYPE_LABELS,
  SUBMIT_BLOCKED_MESSAGE,
  describeTimeLeft,
  formatFullDeadline,
  getDeadlineUrgency,
} from "@/features/classes/utils/assignmentFormat";
import { type AssignmentDetail, type AssignmentType } from "@/features/classes/types/assignmentTypes";
import { cn } from "@/shared/utils/cn";

function AssignmentTypeIcon({
  type,
  size = 14,
  className,
  strokeWidth = 2,
}: {
  type: AssignmentType;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  switch (type) {
    case "RHYTHM":
      return <Activity size={size} className={className} strokeWidth={strokeWidth} />;
    case "RECORDING":
      return <Mic size={size} className={className} strokeWidth={strokeWidth} />;
    case "PRACTICE":
      return <Music2 size={size} className={className} strokeWidth={strokeWidth} />;
    case "EXAM":
      return <Award size={size} className={className} strokeWidth={strokeWidth} />;
    case "SHEET":
      return <BookOpen size={size} className={className} strokeWidth={strokeWidth} />;
    case "BONUS":
      return <Award size={size} className={className} strokeWidth={strokeWidth} />;
    default:
      return <Music2 size={size} className={className} strokeWidth={strokeWidth} />;
  }
}

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bvc-line/80 py-2.5 text-[13px] last:border-0">
      <span className="text-bvc-muted">{label}</span>
      <span className={cn("text-right font-semibold", highlight ? "text-bvc-accent font-bold" : "text-bvc-ink")}>
        {value}
      </span>
    </div>
  );
}

function AssignmentRequirementsCard({ assignment }: { assignment: AssignmentDetail }) {
  return (
    <div className="rounded-2xl border border-bvc-border bg-white p-4.5 shadow-2xs md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-bvc-muted">Yêu cầu bài tập</p>
        <span className="text-[12px] font-semibold text-bvc-muted">{assignment.className}</span>
      </div>

      <div className="mt-2.5 flex flex-col">
        <InfoRow label="Lớp học" value={assignment.className} />
        <InfoRow label="Hạn nộp" value={formatFullDeadline(assignment.deadline)} />
        {assignment.pieceTitle && <InfoRow label="Bản nhạc" value={assignment.pieceTitle} />}
        {assignment.targetBpm !== null && <InfoRow label="Tốc độ BPM" value={`${assignment.targetBpm} BPM`} />}
        <InfoRow label="Accuracy tối thiểu" value={`${assignment.minAccuracy}%`} highlight />
        <InfoRow label="Lượt nộp tối đa" value={`${assignment.usedSubmissions} / ${assignment.maxSubmissions}`} />
      </div>

      <div className="mt-3.5 rounded-xl border border-bvc-border bg-bvc-surface/40 p-3">
        <div className="flex items-center justify-between text-[11.5px] font-bold">
          <span className="flex items-center gap-1 text-bvc-muted">
            <Target size={13} className="text-bvc-accent" />
            <span>Ngưỡng đạt</span>
          </span>
          <span className="font-bvc-mono font-black text-bvc-ink">≥ {assignment.minAccuracy}%</span>
        </div>
        <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bvc-border/80">
          <div
            className="h-full rounded-full bg-bvc-accent transition-all duration-300"
            style={{ width: `${assignment.minAccuracy}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10.5px] text-bvc-muted">
          <span>0%</span>
          <span className="font-semibold text-bvc-accent">Ngưỡng đạt {assignment.minAccuracy}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

function AssignmentRubricCard({ rubric }: { rubric: { name: string; weight: number }[] }) {
  if (!rubric || rubric.length === 0) return null;

  return (
    <div className="rounded-2xl border border-bvc-border bg-white p-4.5 shadow-2xs md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-bvc-muted">Rubric chấm điểm</p>
        <span className="font-bvc-mono text-[11px] font-semibold text-bvc-muted">Tổng 100%</span>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {rubric.map((criterion) => (
          <div
            key={criterion.name}
            className="flex flex-col gap-1 border-b border-bvc-line/50 pb-2.5 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-bvc-ink">{criterion.name}</span>
              <span className="font-bvc-mono text-[12px] font-bold text-bvc-accent">{criterion.weight}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bvc-surface">
              <div
                className="h-full rounded-full bg-bvc-accent transition-all duration-300"
                style={{ width: `${criterion.weight}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttemptTimeline({ assignment }: { assignment: AssignmentDetail }) {
  const max = assignment.maxSubmissions;
  const submissions = assignment.submissions;

  return (
    <div className="rounded-2xl border border-bvc-border bg-white p-4 shadow-2xs md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-bvc-muted">
          Tiến trình nộp bài ({assignment.usedSubmissions}/{max} lượt)
        </p>
        <span className="text-[11.5px] font-semibold text-bvc-muted">
          {assignment.canSubmit ? "Có thể nộp thêm" : "Đã khóa nộp"}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: max }).map((_, idx) => {
          const attemptNumber = idx + 1;
          const sub = submissions.find((s) => s.attemptNumber === attemptNumber);
          const isCurrentOrPast = idx < assignment.usedSubmissions;

          return (
            <div
              key={attemptNumber}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all",
                sub
                  ? "border-bvc-accent/60 bg-bvc-accent-tint/30 text-bvc-ink"
                  : isCurrentOrPast
                    ? "border-bvc-border bg-bvc-surface text-bvc-ink"
                    : "border-dashed border-bvc-border/90 bg-white text-bvc-muted"
              )}
            >
              <div className="flex items-center gap-1">
                {sub ? (
                  <CheckCircle2 size={13} className="text-bvc-ok" />
                ) : (
                  <span className="font-bvc-mono text-[11px] font-bold text-bvc-faint">#{attemptNumber}</span>
                )}
                <span className="text-[11.5px] font-bold">Lượt {attemptNumber}</span>
              </div>
              <span className="font-bvc-mono text-[12px] font-extrabold text-bvc-ink mt-0.5">
                {sub && sub.accuracy !== null ? `${Math.round(sub.accuracy * 100)}%` : sub ? "Đã nộp" : "Chưa nộp"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AssignmentStudioBoxProps {
  assignment: AssignmentDetail;
  recordingTarget: string | null;
  ensembleTarget: string;
  onNavigate: (to: string) => void;
}

function AssignmentStudioBox({ assignment, recordingTarget, ensembleTarget, onNavigate }: AssignmentStudioBoxProps) {
  const isEnsemble = assignment.kind === "ENSEMBLE";

  return (
    <div className="rounded-2xl border border-bvc-border bg-white p-4.5 shadow-2xs sm:p-5">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-bvc-accent-tint text-bvc-accent">
            {isEnsemble ? <Music2 size={20} strokeWidth={2.2} /> : <Mic size={20} strokeWidth={2.2} />}
          </div>
          <div>
            <h3 className="font-bvc-display text-[15px] font-bold text-bvc-ink">
              {isEnsemble ? "Hòa tấu cùng bè ảo" : "Thu âm diễn tấu"}
            </h3>
            <p className="text-[12px] text-bvc-muted">
              {isEnsemble
                ? !assignment.hasEnsembleTracks
                  ? "Bài nhạc chưa có bè ảo cho các nhạc cụ khác."
                  : assignment.canSubmit
                    ? "Thu bè của bạn trong khi nghe các bè ảo; bản thu được chấm theo bản mẫu nhạc cụ của bạn."
                    : "Bài nộp đã khóa hoặc bạn đã sử dụng hết số lượt quy định."
                : assignment.canSubmit
                  ? "Thu trực tiếp bằng micro hoặc tải lên bản thu (.wav, .m4a, .mp3)"
                  : "Bài nộp đã khóa hoặc bạn đã sử dụng hết số lượt quy định."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {isEnsemble ? (
            <button
              type="button"
              disabled={!assignment.canSubmit || !assignment.pieceId || !assignment.hasEnsembleTracks}
              onClick={() => onNavigate(ensembleTarget)}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-accent px-4.5 text-[13px] font-bold text-white shadow-2xs transition-all hover:bg-bvc-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Music2 size={16} strokeWidth={2.2} />
              <span>Luyện &amp; nộp hòa tấu</span>
            </button>
          ) : (
            <>
              {assignment.hasEnsembleTracks && assignment.pieceId && (
                <button
                  type="button"
                  onClick={() => onNavigate(`/ensemble/new?pieceId=${assignment.pieceId}`)}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-bvc-border bg-white px-3.5 text-[12.5px] font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface active:scale-[0.98]"
                >
                  <Music2 size={15} strokeWidth={2.2} />
                  <span>Luyện cùng bè ảo</span>
                </button>
              )}

              <button
                type="button"
                disabled={!assignment.canSubmit || !recordingTarget}
                onClick={() => recordingTarget && onNavigate(recordingTarget)}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-accent px-4.5 text-[13px] font-bold text-white shadow-2xs transition-all hover:bg-bvc-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mic size={16} strokeWidth={2.2} />
                <span>Thu âm / Tải bản thu</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!assignment.canSubmit && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50/60 p-2.5 text-center text-[12px] font-medium text-bvc-error">
          {SUBMIT_BLOCKED_MESSAGE}
        </div>
      )}
    </div>
  );
}

export function AssignmentPage() {
  const navigate = useNavigate();
  const { assignmentId = "" } = useParams();
  const { assignment, error, isLoading } = useAssignmentDetail(assignmentId);

  if (isLoading || !assignment) {
    return (
      <StudentShell>
        <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-4 px-3.5 py-4 sm:px-6 md:gap-6 md:px-10 md:py-8">
          <Link
            to="/assignments"
            className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-bvc-accent transition-colors hover:text-bvc-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại bài tập của tôi</span>
          </Link>
          <div className="py-20 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2.5 text-bvc-muted">
                <span className="size-6 animate-spin rounded-full border-2 border-bvc-accent border-t-transparent" />
                <span className="text-[14px] font-semibold">Đang tải chi tiết bài tập...</span>
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

  const urgency = getDeadlineUrgency(assignment.deadline);
  const recordingTarget = assignment.pieceId ? `/library/${assignment.pieceId}?assignmentId=${assignment.id}` : null;
  const ensembleTarget = `/ensemble/new?pieceId=${assignment.pieceId}&assignmentId=${assignment.id}`;

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col gap-4 px-3.5 py-4 sm:px-6 md:gap-5 md:px-10 md:py-8">
        <div className="flex items-center justify-between">
          <Link
            to="/assignments"
            className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-bvc-accent transition-colors hover:text-bvc-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại danh sách bài tập</span>
          </Link>
          <span className="text-[12.5px] font-semibold text-bvc-muted">{assignment.className}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-bvc-border bg-white p-5 shadow-2xs sm:p-6">
              <div className="pointer-events-none absolute -bottom-8 -right-8 size-36 opacity-[0.03]">
                <AssignmentTypeIcon type={assignment.type} size={144} className="text-bvc-ink" />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap text-[12px]">
                <div className="flex items-center gap-2 text-bvc-muted">
                  <AssignmentTypeIcon type={assignment.type} size={14} className="text-bvc-accent" strokeWidth={2.2} />
                  <span className="font-bold text-bvc-ink">{assignment.className}</span>
                  {assignment.weekNo && (
                    <>
                      <span className="text-bvc-line">·</span>
                      <span>Tuần {assignment.weekNo}</span>
                    </>
                  )}
                  <span className="text-bvc-line">·</span>
                  <span>{ASSIGNMENT_TYPE_LABELS[assignment.type] || "Bài tập"}</span>
                </div>

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

              <h1 className="mt-3.5 font-bvc-display text-[22px] font-black tracking-tight text-bvc-ink sm:text-[25px] md:text-[28px]">
                {assignment.title}
              </h1>

              <div
                className={cn(
                  "mt-4 flex items-center justify-between gap-3 rounded-2xl border p-3.5",
                  urgency === "overdue"
                    ? "border-red-200 bg-red-50/60 text-bvc-error"
                    : "border-bvc-accent-border/80 bg-bvc-accent-tint/70 text-bvc-accent-text"
                )}
              >
                <div className="flex items-center gap-2">
                  {urgency === "overdue" ? (
                    <AlertCircle size={17} className="shrink-0 text-bvc-error" />
                  ) : (
                    <Clock size={17} className="shrink-0 text-bvc-accent-text" />
                  )}
                  <span className="text-[13px] font-bold">Hạn nộp: {formatFullDeadline(assignment.deadline)}</span>
                </div>
                <span className="rounded-lg bg-white/90 px-2.5 py-1 font-bvc-mono text-[11.5px] font-bold shadow-2xs">
                  {describeTimeLeft(assignment.deadline, new Date())}
                </span>
              </div>

              {assignment.description && (
                <div className="mt-4 border-t border-bvc-line/90 pt-3.5">
                  <p className="mb-1 text-[11.5px] font-bold uppercase tracking-wider text-bvc-muted">
                    Hướng dẫn từ giảng viên
                  </p>
                  <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-bvc-ink/90 sm:text-[14px]">
                    {assignment.description}
                  </p>
                </div>
              )}
            </div>

            <AttemptTimeline assignment={assignment} />

            <AssignmentStudioBox
              assignment={assignment}
              recordingTarget={recordingTarget}
              ensembleTarget={ensembleTarget}
              onNavigate={navigate}
            />

            <div className="flex flex-col gap-4 lg:hidden">
              <AssignmentRequirementsCard assignment={assignment} />
              <AssignmentRubricCard rubric={assignment.rubric} />
            </div>

            <MySubmissionList submissions={assignment.submissions} />
          </div>

          <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-24">
            <AssignmentRequirementsCard assignment={assignment} />
            <AssignmentRubricCard rubric={assignment.rubric} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex flex-col gap-2 border-t border-bvc-border bg-white/95 p-3.5 backdrop-blur-sm lg:hidden shadow-lg">
        {!assignment.canSubmit && (
          <p className="text-center text-[12px] font-medium text-bvc-error">{SUBMIT_BLOCKED_MESSAGE}</p>
        )}
        {assignment.kind === "ENSEMBLE" ? (
          <button
            type="button"
            disabled={!assignment.canSubmit || !assignment.pieceId || !assignment.hasEnsembleTracks}
            onClick={() => navigate(ensembleTarget)}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-accent text-[14px] font-bold text-white shadow-sm transition-all hover:bg-bvc-ink active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Music2 size={17} strokeWidth={2.2} />
            <span>Luyện &amp; nộp hòa tấu</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={!assignment.canSubmit || !recordingTarget}
              onClick={() => recordingTarget && navigate(recordingTarget)}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-accent text-[14px] font-bold text-white shadow-sm transition-all hover:bg-bvc-ink active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={17} strokeWidth={2.2} />
              <span>Thu âm / Tải lên</span>
            </button>

            {assignment.hasEnsembleTracks && assignment.pieceId && (
              <button
                type="button"
                onClick={() => navigate(`/ensemble/new?pieceId=${assignment.pieceId}`)}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-bvc-border bg-white text-[13px] font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface"
              >
                <Music2 size={15} strokeWidth={2.2} />
                <span>Luyện cùng bè ảo</span>
              </button>
            )}
          </>
        )}
      </div>
    </StudentShell>
  );
}
