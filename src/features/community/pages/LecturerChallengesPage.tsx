import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { ChallengeStatusBadge } from "@/features/community/components/ChallengeStatusBadge";
import { useLecturerChallenges } from "@/features/community/hooks/useLecturerChallenges";
import { type Challenge } from "@/features/community/types/challenge";
import { formatWeekRange } from "@/features/community/utils/challengeFormat";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { Pagination } from "@/shared/components/bvc/Pagination";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";

const NEW_PATH = "/teacher/challenges/new";

interface ChallengeRowProps {
  challenge: Challenge;
  onEdit: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
}

function ChallengeRow({ challenge, onEdit, onDelete }: ChallengeRowProps) {
  const isDraft = challenge.status === "DRAFT";
  const week =
    challenge.startsAt && challenge.endsAt ? formatWeekRange(challenge.startsAt, challenge.endsAt) : "Chưa chọn tuần";
  const scope = challenge.classes.length > 0 ? challenge.classes.map((item) => item.name).join(", ") : "Chưa chọn lớp";

  return (
    <li className="flex flex-col gap-[10px] rounded-[18px] border border-bvc-border p-[15px] lg:flex-row lg:items-center lg:gap-[16px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-[15px] font-bold text-bvc-ink">{challenge.title}</span>
        <span className="text-[13px] text-bvc-muted">{challenge.instrument?.name ?? "Chưa chọn nhạc cụ"}</span>
      </div>
      <span className="font-mono text-[13px] text-bvc-muted lg:w-[170px]">{week}</span>
      <span className="min-w-0 text-[13px] text-bvc-muted lg:w-[200px]">{scope}</span>
      <span className="lg:w-[120px]">
        <ChallengeStatusBadge status={challenge.displayStatus} />
      </span>
      {isDraft && (
        <div className="flex gap-[8px]">
          <ActionButton onClick={() => onEdit(challenge)}>Sửa</ActionButton>
          <ActionButton onClick={() => onDelete(challenge)}>Xóa</ActionButton>
        </div>
      )}
    </li>
  );
}

export function LecturerChallengesPage() {
  const navigate = useNavigate();
  const { items, page, totalPages, setPage, isLoading, isWorking, error, reload, remove } = useLecturerChallenges();
  const [pendingDelete, setPendingDelete] = useState<Challenge | null>(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const outcome = await remove(pendingDelete.id);
    setPendingDelete(null);
    if ("error" in outcome) toast.error(outcome.error);
    else toast.success(outcome.message);
  };

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title="Quản lý thử thách"
        subtitle="Thử thách hằng tuần"
        onBack={() => navigate("/teacher/home")}
        actions={
          <ActionButton variant="primary" onClick={() => navigate(NEW_PATH)}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Tạo thử thách
          </ActionButton>
        }
      />
      <div className="flex grow flex-col gap-[14px] px-[18px] pb-[24px] pt-[14px] lg:px-[32px] lg:pt-[20px]">
        <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
          {items.length === 0 ? (
            <EmptyState title="Bạn chưa có thử thách." />
          ) : (
            <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
              {items.map((challenge) => (
                <ChallengeRow
                  key={challenge.id}
                  challenge={challenge}
                  onEdit={(item) => navigate(`/teacher/challenges/${item.id}/edit`)}
                  onDelete={setPendingDelete}
                />
              ))}
            </ul>
          )}
        </ListState>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Xóa thử thách?"
        description="Thử thách bản nháp sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmLabel="Xóa"
        isConfirming={isWorking}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </TeacherScreen>
  );
}
