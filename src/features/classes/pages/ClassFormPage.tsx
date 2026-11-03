import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Music, Users } from "lucide-react";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { ListState } from "@/features/classes/components/ListState";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useSaveClass } from "@/features/classes/hooks/useSaveClass";
import { useSemesters } from "@/features/classes/hooks/useSemesters";
import { type ClassPayload } from "@/features/classes/types/classTypes";
import { LeaveConfirmDialog } from "@/shared/components/bvc/LeaveConfirmDialog";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";
import { useLeaveGuard } from "@/shared/hooks/useLeaveGuard";

const FINISHED_CLASS_MESSAGE = "Không thể sửa lớp vì lớp đã kết thúc.";

const NOTES = [
  "Môn học và học kỳ bị khóa sau khi lớp bắt đầu",
  "Sinh viên có thể được thêm hoặc xóa sau",
  "Ngày bắt đầu và kết thúc của lớp lấy theo học kỳ do quản trị viên cấu hình",
];

// Sửa lớp học (tạo lớp mở bằng modal ClassCreateDialog)
export function ClassFormPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { classDetail, isLoading: isClassLoading, error: classError, reload } = useClassDetail(classId);
  const { instruments, isLoading: isInstrumentLoading, error: instrumentError } = useInstruments();
  const { semesters, defaultSemesterName, isLoading: isSemesterLoading, error: semesterError } = useSemesters();
  const { saveClass, isSaving } = useSaveClass(classId);
  const [isDirty, setIsDirty] = useState(false);
  const { guard, confirmProps } = useLeaveGuard({ isDirty });
  const backPath = `/teacher/classes/${classId}`;
  const leave = () => guard(() => navigate(backPath));

  const handleSubmit = async (payload: Partial<ClassPayload>) => {
    const result = await saveClass(payload);
    if ("classDetail" in result) {
      toast.success(result.message);
      setIsDirty(false);
      navigate(`/teacher/classes/${result.classDetail.id}`, { replace: true });
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  const isLoading = isInstrumentLoading || isSemesterLoading || isClassLoading;
  const loadError = instrumentError ?? semesterError ?? classError;
  const isFinished = classDetail?.isReadOnly ?? false;

  return (
    <TeacherScreen>
      <TeacherPageHeader title="Sửa lớp học" subtitle={classDetail?.name} onBack={leave} />
      {isLoading || loadError || isFinished || !classDetail ? (
        <div className="px-[18px] lg:px-[32px] lg:pt-[22px]">
          <ListState
            isLoading={isLoading}
            error={loadError}
            isEmpty={isFinished}
            emptyMessage={FINISHED_CLASS_MESSAGE}
            onRetry={reload}
          >
            {null}
          </ListState>
        </div>
      ) : (
        <div className="flex grow flex-col lg:flex-row lg:items-start">
          <ClassForm
            key={classDetail.id}
            classDetail={classDetail}
            instruments={instruments}
            semesters={semesters}
            defaultSemesterName={defaultSemesterName}
            isSaving={isSaving}
            onCancel={leave}
            onSubmit={handleSubmit}
            onDirtyChange={setIsDirty}
          />
          <aside className="mx-[18px] mb-6 flex flex-col gap-2.5 rounded-bvc-xl bg-bvc-surface p-[18px] lg:mx-0 lg:mt-[22px] lg:mr-8 lg:w-[340px] lg:shrink-0">
            <span className="flex items-center gap-2 text-[15px] font-semibold text-bvc-ink">
              <Users size={16} className="text-bvc-muted" aria-hidden />
              Lưu ý
            </span>
            <ul className="flex flex-col gap-2">
              {NOTES.map((note) => (
                <li key={note} className="flex items-start gap-2 text-[13px] text-bvc-muted">
                  <Music size={14} className="mt-0.5 shrink-0" aria-hidden />
                  {note}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
      <LeaveConfirmDialog {...confirmProps} />
    </TeacherScreen>
  );
}
