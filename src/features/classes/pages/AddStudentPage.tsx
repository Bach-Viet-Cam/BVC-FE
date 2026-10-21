import { useNavigate, useParams } from "react-router-dom";
import { AddStudentForm } from "@/features/classes/components/AddStudentForm";
import { ClassWriteGuard } from "@/features/classes/components/ClassWriteGuard";
import { useAddStudent } from "@/features/classes/hooks/useAddStudent";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type StudentFormValues } from "@/features/classes/utils/validateStudent";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { toast } from "@/shared/components/ui/toast";

export function AddStudentPage() {
  const navigate = useNavigate();
  const { classId = "" } = useParams<{ classId: string }>();
  const { classDetail, isLoading, error, reload } = useClassDetail(classId);
  const { addStudent, isSaving } = useAddStudent(classId);
  const backPath = `/teacher/classes/${classId}`;

  const handleSubmit = async (values: StudentFormValues): Promise<ApiFieldError[] | null> => {
    const result = await addStudent(values);
    if ("message" in result) {
      toast.success(result.message);
      navigate(backPath);
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  return (
    <MobileScreen>
      <MobileHeader
        title="Thêm sinh viên"
        subtitle={classDetail ? `${classDetail.name} · ${classDetail.cohort}` : undefined}
        onBack={() => navigate(backPath)}
      />
      <ClassWriteGuard
        classDetail={classDetail}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        blockedMessage="Không thể thêm sinh viên vì lớp đã kết thúc."
      >
        {() => <AddStudentForm isSaving={isSaving} onCancel={() => navigate(backPath)} onSubmit={handleSubmit} />}
      </ClassWriteGuard>
    </MobileScreen>
  );
}
