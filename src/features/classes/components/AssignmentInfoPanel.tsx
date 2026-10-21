import { Link } from "react-router-dom";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type AssignmentBase, type AssignmentStatus } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS, ASSIGNMENT_STATUS_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";

export type AssignmentPanelAction = "publish" | "close" | "reopen" | "delete";

interface AssignmentInfoPanelProps {
  assignment: AssignmentBase;
  isWorking?: boolean;
  onAction: (action: AssignmentPanelAction) => void;
}

const STATUS_TONES: Record<AssignmentStatus, "ok" | "warn" | "muted"> = {
  PUBLISHED: "ok",
  DRAFT: "warn",
  CLOSED: "muted",
};
const STATUS_ACTION: Record<AssignmentStatus, { action: AssignmentPanelAction; label: string }> = {
  DRAFT: { action: "publish", label: "Đăng" },
  PUBLISHED: { action: "close", label: "Đóng" },
  CLOSED: { action: "reopen", label: "Mở lại" },
};

export function AssignmentInfoPanel({ assignment, isWorking = false, onAction }: AssignmentInfoPanelProps) {
  const canEdit = assignment.classStatus === "ACTIVE";
  const statusAction = STATUS_ACTION[assignment.status];

  return (
    <section className="mx-[18px] mb-[14px] flex flex-col gap-[12px] rounded-[18px] bg-bvc-soft p-[14px]">
      <div className="flex flex-wrap items-center gap-[8px]">
        <StatusLabel label={ASSIGNMENT_STATUS_LABELS[assignment.status]} tone={STATUS_TONES[assignment.status]} />
        <span className="rounded-[8px] bg-white px-[9px] py-[4px] text-[12px]">
          {ASSIGNMENT_KIND_LABELS[assignment.kind]}
        </span>
        <span className="text-[12.5px] text-bvc-muted">Phiên bản v{assignment.version}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-[12px] gap-y-[10px]">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[12px] text-bvc-muted">Lớp</span>
          <span className="text-[14.5px] font-semibold">{assignment.className}</span>
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="text-[12px] text-bvc-muted">BPM</span>
          <span className="font-bvc-mono text-[14.5px] font-semibold">
            {assignment.effectiveBpm ? `${assignment.effectiveBpm} BPM` : "-"}
          </span>
        </div>
        <div className="col-span-2 flex flex-col gap-[2px]">
          <span className="text-[12px] text-bvc-muted">Bài nhạc</span>
          <span className="flex flex-wrap items-center gap-[8px] text-[14.5px] font-semibold">
            {assignment.piece?.title ?? "Không chọn"}
            {assignment.piece && !assignment.piece.isAvailable && (
              <span className="rounded-[8px] bg-bvc-accent-tint px-[8px] py-[2px] text-[11.5px] font-normal text-bvc-accent-text">
                Không còn khả dụng
              </span>
            )}
          </span>
        </div>
      </div>
      {assignment.description && (
        <p className="m-0 whitespace-pre-line text-[13.5px] leading-[1.5]">{assignment.description}</p>
      )}
      {canEdit && (
        <div className="grid grid-cols-3 gap-[8px]">
          <Link
            to={`/teacher/assignments/${assignment.id}/edit`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13px] font-semibold text-bvc-ink"
          >
            Sửa
          </Link>
          <ActionButton
            variant={statusAction.action === "close" ? "accent" : "primary"}
            disabled={isWorking}
            onClick={() => onAction(statusAction.action)}
          >
            {statusAction.label}
          </ActionButton>
          <ActionButton disabled={isWorking} onClick={() => onAction("delete")}>
            Xóa
          </ActionButton>
        </div>
      )}
    </section>
  );
}
