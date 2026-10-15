import { useNavigate, useParams } from "react-router-dom";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { ListState } from "@/features/classes/components/ListState";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useSaveClass } from "@/features/classes/hooks/useSaveClass";
import { type ApiFieldError, type ClassPayload } from "@/features/classes/types/classTypes";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { toast } from "@/shared/components/ui/toast";

const FINISHED_CLASS_MESSAGE = "Không thể sửa lớp vì lớp đã kết thúc.";

export function ClassFormPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const isCreate = !classId;
  const { classDetail, isLoading: isClassLoading, error: classError, reload } = useClassDetail(classId);
  const { instruments, isLoading: isInstrumentLoading, error: instrumentError } = useInstruments();
  const { saveClass, isSaving } = useSaveClass(classId);
  const backPath = classId ? `/teacher/classes/${classId}` : "/teacher/classes";

  const handleSubmit = async (payload: Partial<ClassPayload>): Promise<ApiFieldError[] | null> => {
    const result = await saveClass(payload);
    if ("classDetail" in result) {
      toast.success(result.message);
      navigate(`/teacher/classes/${result.classDetail.id}`, { replace: true });
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  const isLoading = isInstrumentLoading || (!isCreate && isClassLoading);
  const loadError = instrumentError ?? (isCreate ? null : classError);
  const isFinished = classDetail?.isReadOnly ?? false;

  return (
    <MobileScreen>
      <MobileHeader
        title={isCreate ? "Tạo lớp" : "Sửa lớp"}
        subtitle={classDetail?.name}
        onBack={() => navigate(backPath)}
      />
      {isLoading || loadError || isFinished ? (
        <div className="px-[18px]">
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
        <ClassForm
          key={classDetail?.id ?? "new"}
          classDetail={isCreate ? null : classDetail}
          instruments={instruments}
          isSaving={isSaving}
          onCancel={() => navigate(backPath)}
          onSubmit={handleSubmit}
        />
      )}
    </MobileScreen>
  );
}
