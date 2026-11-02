import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type Member } from "@/features/classes/types/classTypes";
import { ACCOUNT_STATUS_LABELS } from "@/features/classes/utils/classFormat";

interface MemberCardProps {
  member: Member;
  canRemove: boolean;
  onRemove: (member: Member) => void;
}

export function MemberCard({ member, canRemove, onRemove }: MemberCardProps) {
  return (
    <article className="flex flex-col gap-[10px] rounded-bvc-xl border border-bvc-border px-[14px] py-[13px]">
      <div className="flex justify-between gap-[10px]">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[15px] font-semibold">{member.fullName}</span>
          <span className="break-all text-[12px] text-bvc-muted">
            <span className="font-bvc-mono">{member.studentCode ?? "-"}</span> · {member.email}
          </span>
        </span>
        <StatusLabel
          label={ACCOUNT_STATUS_LABELS[member.accountStatus]}
          tone={member.accountStatus === "ACTIVE" ? "ok" : "warn"}
          className="text-[12px]"
        />
      </div>
      {/* "Xem đánh giá" waits for the Student Review & Feedback design (sub-project 4). */}
      {canRemove && (
        <div className="flex justify-end gap-[8px]">
          <ActionButton
            variant="secondary"
            onClick={() => onRemove(member)}
            aria-label={`Xóa ${member.fullName} khỏi lớp`}
          >
            Xóa
          </ActionButton>
        </div>
      )}
    </article>
  );
}
