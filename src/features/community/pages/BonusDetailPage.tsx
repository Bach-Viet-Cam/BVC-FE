import { useNavigate, useParams } from "react-router-dom";
import { MobileHeader, TagBadge } from "@/shared/components/bvc";
import { useAssignmentDetail } from "@/features/classes/hooks/useAssignmentDetail";
import {
  ASSIGNMENT_STATUS_META,
  SUBMIT_BLOCKED_MESSAGE,
  formatFullDeadline,
} from "@/features/classes/utils/assignmentFormat";

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bvc-line py-[10px] text-[13px] last:border-0">
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
      <>
        <MobileHeader title="Chi tiết bài bonus" onBack={() => navigate("/community/bonus")} />
        <p className={`px-[14px] text-[14px] ${error ? "text-bvc-error" : "text-bvc-muted"}`}>
          {isLoading ? "Đang tải..." : error}
        </p>
      </>
    );
  }

  const status = ASSIGNMENT_STATUS_META[assignment.status];

  return (
    <>
      <MobileHeader
        title="Chi tiết bài bonus"
        subtitle={assignment.className}
        onBack={() => navigate("/community/bonus")}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[16px]">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[17px] font-extrabold leading-snug text-bvc-ink">{assignment.title}</h2>
            <TagBadge label={status.label} variant={status.variant} />
          </div>
          {assignment.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-bvc-muted">{assignment.description}</p>
          )}
          <div className="mt-3">
            <InfoRow label="Accuracy tối thiểu" value={`${assignment.minAccuracy}%`} />
            <InfoRow label="Hạn nộp" value={formatFullDeadline(assignment.deadline)} />
            {assignment.targetBpm !== null && <InfoRow label="BPM yêu cầu" value={String(assignment.targetBpm)} />}
            <InfoRow label="Lượt nộp" value={`${assignment.usedSubmissions} / ${assignment.maxSubmissions}`} />
            {assignment.bonusPoints !== null && (
              <InfoRow label="Điểm có thể nhận" value={`+${assignment.bonusPoints}`} />
            )}
          </div>
        </div>
        <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[16px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">Cách tính điểm</p>
          <p className="mt-2 text-[13px] leading-relaxed text-bvc-muted">
            Bài bonus được đánh giá theo % accuracy của bài nộp, không có điểm chữ hay điểm số. Điểm bonus chỉ được cộng
            vào tổng sau khi giảng viên xác nhận.
          </p>
        </div>
        <div className="h-4" />
      </div>
      <div className="flex shrink-0 flex-col gap-[8px] px-[14px] pb-5 pt-3">
        {!assignment.canSubmit && <p className="text-center text-[12.5px] text-bvc-error">{SUBMIT_BLOCKED_MESSAGE}</p>}
        <button
          type="button"
          disabled={!assignment.canSubmit}
          onClick={() => navigate(`/community/bonus/${assignment.id}/submit`)}
          className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-bvc-accent text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Do &amp; Submit
        </button>
      </div>
    </>
  );
}
