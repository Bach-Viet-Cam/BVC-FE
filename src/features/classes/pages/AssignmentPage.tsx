import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { MobileHeader, TagBadge } from "@/shared/components/bvc";
import { MySubmissionList } from "@/features/classes/components/MySubmissionList";
import { useAssignmentDetail } from "@/features/classes/hooks/useAssignmentDetail";
import {
  ASSIGNMENT_STATUS_META,
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
    <div className="flex items-center justify-between gap-3 border-b border-bvc-line py-[10px] text-[13px] last:border-0">
      <span className="text-bvc-muted">{label}</span>
      <span className="text-right font-semibold text-bvc-ink">{value}</span>
    </div>
  );
}

export function AssignmentPage() {
  const navigate = useNavigate();
  const { assignmentId = "" } = useParams();
  const { assignment, error, isLoading } = useAssignmentDetail(assignmentId);

  if (isLoading || !assignment) {
    return (
      <>
        <MobileHeader title="Chi tiết bài tập" onBack={() => navigate("/assignments")} />
        <p className={`px-[14px] text-[14px] ${error ? "text-bvc-error" : "text-bvc-muted"}`}>
          {isLoading ? "Đang tải..." : error}
        </p>
      </>
    );
  }

  const status = ASSIGNMENT_STATUS_META[assignment.status];
  // Học viên chọn bản nhạc (nhạc cụ) trên trang bài nhạc trước khi thu âm; bài tập không có bài nhạc thì không nộp qua M01
  const recordingTarget = assignment.pieceId ? `/library/${assignment.pieceId}?assignmentId=${assignment.id}` : null;
  const ensembleTarget = `/ensemble/new?pieceId=${assignment.pieceId}&assignmentId=${assignment.id}`;

  return (
    <>
      <MobileHeader
        title="Chi tiết bài tập"
        subtitle={assignment.weekNo ? `${assignment.className} · Tuần ${assignment.weekNo}` : assignment.className}
        onBack={() => navigate("/assignments")}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-[14px] mt-3 flex items-center gap-3 rounded-[18px] border border-[#F3D98A] bg-[#FEF8EC] p-[12px]">
          <Clock size={20} className="shrink-0 text-bvc-warn" strokeWidth={1.8} />
          <span className="flex-1 text-[13px] font-bold text-[#A07010]">
            Hạn nộp: {formatFullDeadline(assignment.deadline)}
          </span>
          <span className="shrink-0 text-[12px] text-bvc-muted">
            {describeTimeLeft(assignment.deadline, new Date())}
          </span>
        </div>

        <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[16px]">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[17px] font-extrabold leading-snug text-bvc-ink">{assignment.title}</h2>
            <TagBadge label={status.label} variant={status.variant} />
          </div>
          {assignment.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-bvc-muted">{assignment.description}</p>
          )}
          <div className="mt-3">
            <InfoRow label="Lớp" value={assignment.className} />
            <InfoRow label="Hạn nộp" value={formatFullDeadline(assignment.deadline)} />
            {assignment.pieceTitle && <InfoRow label="Bản nhạc" value={assignment.pieceTitle} />}
            {assignment.targetBpm !== null && <InfoRow label="BPM yêu cầu" value={String(assignment.targetBpm)} />}
            <InfoRow label="Accuracy tối thiểu" value={`${assignment.minAccuracy}%`} />
            <InfoRow label="Lượt nộp" value={`${assignment.usedSubmissions} / ${assignment.maxSubmissions}`} />
          </div>
        </div>

        {assignment.rubric.length > 0 && (
          <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[16px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">Rubric chấm điểm</p>
            <div className="mt-2 flex flex-col gap-2">
              {assignment.rubric.map((criterion) => (
                <div key={criterion.name} className="flex items-center gap-3">
                  <span className="flex-1 text-[13px] text-bvc-ink">{criterion.name}</span>
                  <div className="h-[4px] w-[90px] overflow-hidden rounded-full bg-bvc-border">
                    <div className="h-full rounded-full bg-bvc-bar-strong" style={{ width: `${criterion.weight}%` }} />
                  </div>
                  <span className="w-[36px] text-right font-mono text-[12.5px] text-bvc-muted">
                    {criterion.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <MySubmissionList submissions={assignment.submissions} />
        <div className="h-4" />
      </div>

      <div className="flex shrink-0 flex-col gap-[8px] px-[14px] pb-5 pt-3">
        {!assignment.canSubmit && <p className="text-center text-[12.5px] text-bvc-error">{SUBMIT_BLOCKED_MESSAGE}</p>}
        <button
          type="button"
          disabled={!assignment.canSubmit || !recordingTarget}
          onClick={() => recordingTarget && navigate(recordingTarget)}
          className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-bvc-accent text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Thu âm / Tải lên
        </button>
        {assignment.hasEnsembleTracks && assignment.pieceId && (
          <button
            type="button"
            onClick={() => navigate(ensembleTarget)}
            className="flex h-[48px] w-full cursor-pointer items-center justify-center rounded-[16px] border border-bvc-border-strong bg-white text-[15px] font-semibold text-bvc-ink"
          >
            Luyện với hòa tấu
          </button>
        )}
      </div>
    </>
  );
}
