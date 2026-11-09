import { useState } from "react";
import { LecturerPicker } from "@/features/classes/components/LecturerPicker";
import { type LecturersUpdater, useClassLecturers } from "@/features/classes/hooks/useClassLecturers";
import { type ClassDetail, type Lecturer } from "@/features/classes/types/classTypes";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";

interface ClassLecturersSectionProps {
  classDetail: ClassDetail;
  onChanged: (update: LecturersUpdater) => void;
}

interface LecturerRowProps {
  lecturer: Lecturer;
  isPrimary?: boolean;
  isDisabled?: boolean;
  onRemove?: (lecturer: Lecturer) => void;
}

function LecturerRow({ lecturer, isPrimary = false, isDisabled = false, onRemove }: LecturerRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[13.5px]">
      <span className="font-medium">{lecturer.fullName}</span>
      <span className="text-bvc-muted">{lecturer.email}</span>
      {isPrimary && <span className="rounded-[8px] bg-bvc-soft px-[8px] py-[2px] text-[12px]">Chính</span>}
      {onRemove && (
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => onRemove(lecturer)}
          aria-label={`Gỡ ${lecturer.fullName}`}
          className="cursor-pointer text-[13px] font-medium text-bvc-error"
        >
          Gỡ
        </button>
      )}
    </li>
  );
}

export function ClassLecturersSection({ classDetail, onChanged }: ClassLecturersSectionProps) {
  const [lecturerToRemove, setLecturerToRemove] = useState<Lecturer | null>(null);
  const { addLecturer, removeLecturer, isSaving } = useClassLecturers(classDetail.id, onChanged);
  const canManage = classDetail.isPrimaryLecturer && !classDetail.isReadOnly;
  const excludedIds = [classDetail.owner.id, ...classDetail.coLecturers.map((lecturer) => lecturer.id)];

  const confirmRemove = async () => {
    if (!lecturerToRemove) return;
    await removeLecturer(lecturerToRemove.id);
    setLecturerToRemove(null);
  };

  return (
    <section
      aria-label="Giảng viên"
      className="flex shrink-0 flex-col gap-[10px] border-b border-bvc-border px-[18px] py-[14px] lg:px-[32px]"
    >
      <h2 className="text-[12px] text-bvc-muted">Giảng viên</h2>
      <ul className="flex flex-col gap-[6px]">
        <LecturerRow lecturer={classDetail.owner} isPrimary />
        {classDetail.coLecturers.map((lecturer) => (
          <LecturerRow
            key={lecturer.id}
            lecturer={lecturer}
            isDisabled={isSaving}
            onRemove={canManage ? setLecturerToRemove : undefined}
          />
        ))}
      </ul>
      {canManage && (
        <div className="max-w-[420px]">
          <LecturerPicker
            id="class-add-lecturer"
            label="Thêm giảng viên cùng dạy"
            value={[]}
            excludedIds={excludedIds}
            disabled={isSaving}
            onChange={(picked) => picked[0] && void addLecturer(picked[0])}
          />
        </div>
      )}
      <ConfirmDialog
        open={lecturerToRemove !== null}
        title={`Gỡ ${lecturerToRemove?.fullName ?? ""} khỏi lớp?`}
        confirmLabel="Gỡ"
        isLoading={isSaving}
        onConfirm={confirmRemove}
        onOpenChange={(open) => !open && setLecturerToRemove(null)}
      />
    </section>
  );
}
