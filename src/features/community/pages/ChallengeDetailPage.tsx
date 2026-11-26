import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mic, Trophy } from "lucide-react";
import { ChallengeStatusBadge } from "@/features/community/components/ChallengeStatusBadge";
import { useStudentChallenge } from "@/features/community/hooks/useStudentChallenge";
import { formatWeekRange } from "@/features/community/utils/challengeFormat";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

const LIST_PATH = "/community/challenges";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-bvc-border bg-bvc-surface/60 px-4 py-3">
      <span className="text-[12px] font-medium text-bvc-muted">{label}</span>
      <span className="text-[15px] font-semibold text-bvc-ink">{value}</span>
    </div>
  );
}

// M04 Chi tiết thử thách (sinh viên)
export function ChallengeDetailPage() {
  const { challengeId } = useParams();
  const { challenge, isLoading, error } = useStudentChallenge(challengeId);

  const backLink = (
    <Link
      to={LIST_PATH}
      className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-bvc-accent transition-colors hover:text-bvc-ink"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
      <span>Quay lại thử thách</span>
    </Link>
  );

  if (!challenge) {
    return (
      <StudentShell>
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-14 md:pt-8">
          {backLink}
          {isLoading ? (
            <div className="flex flex-col items-center gap-2.5 py-20 text-bvc-muted">
              <span className="size-6 animate-spin rounded-full border-2 border-bvc-accent border-t-transparent" />
            </div>
          ) : (
            <EmptyState
              icon={<Trophy className="size-8" strokeWidth={1.5} />}
              title={error ?? "Không tìm thấy thử thách"}
            />
          )}
        </div>
      </StudentShell>
    );
  }

  const practicePath =
    challenge.sheetMusicId && challenge.canPractice
      ? `/practice/sheets/${encodeURIComponent(challenge.sheetMusicId)}/record?challengeId=${encodeURIComponent(challenge.id)}`
      : null;

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-14 md:pt-8">
        {backLink}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <ChallengeStatusBadge status={challenge.displayStatus} />
            <PageTitle>{challenge.title}</PageTitle>
          </div>
          {practicePath ? (
            <Link to={practicePath} className={actionButtonClass("primary", "lg", "hover:text-white")}>
              <Mic size={18} />
              Luyện tập
            </Link>
          ) : (
            <button type="button" disabled className={actionButtonClass("primary", "lg")}>
              <Mic size={18} />
              Luyện tập
            </button>
          )}
        </div>

        {challenge.description && (
          <p className="text-[14.5px] leading-relaxed whitespace-pre-line text-bvc-ink">{challenge.description}</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {challenge.piece && <InfoItem label="Bài nhạc" value={challenge.piece.title} />}
          {challenge.instrument && <InfoItem label="Nhạc cụ" value={challenge.instrument.name} />}
          {challenge.startsAt && challenge.endsAt && (
            <InfoItem label="Thời gian" value={formatWeekRange(challenge.startsAt, challenge.endsAt)} />
          )}
          <InfoItem label="Độ chính xác tối thiểu" value={`${challenge.effectiveMinAccuracy}%`} />
          {challenge.requiredBpm !== null && <InfoItem label="BPM yêu cầu" value={String(challenge.requiredBpm)} />}
          <InfoItem label="Lượt nộp" value={`${challenge.usedSubmissions}/${challenge.maxSubmissions}`} />
          {challenge.bestAccuracy !== null && (
            <InfoItem label="Điểm cao nhất" value={`${Math.round(challenge.bestAccuracy)}%`} />
          )}
        </div>
      </div>
    </StudentShell>
  );
}
