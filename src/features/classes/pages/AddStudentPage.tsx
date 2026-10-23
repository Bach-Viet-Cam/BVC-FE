import { useNavigate, useParams } from "react-router-dom";
import { AddStudentForm } from "@/features/classes/components/AddStudentForm";
import { ClassWriteGuard } from "@/features/classes/components/ClassWriteGuard";
import { useAddStudent } from "@/features/classes/hooks/useAddStudent";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { useLookupMember } from "@/features/classes/hooks/useLookupMember";
import { type ApiFieldError, type MemberLookup } from "@/features/classes/types/classTypes";
import { type StudentFormValues } from "@/features/classes/utils/validateStudent";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";

export function AddStudentPage() {
  const navigate = useNavigate();
  const { classId = "" } = useParams<{ classId: string }>();
  const { classDetail, isLoading, error, reload } = useClassDetail(classId);
  const { addStudent, isSaving } = useAddStudent(classId);
  const { lookupMember, isChecking } = useLookupMember(classId);
  const backPath = `/teacher/classes/${classId}`;

  const handleLookup = async (email: string): Promise<MemberLookup | ApiFieldError[] | null> => {
    const result = await lookupMember(email);
    if ("lookup" in result) return result.lookup;
    if (result.error.fieldErrors.length > 0) return result.error.fieldErrors;
    toast.error(result.error.message);
    return null;
  };

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
    <TeacherScreen>
      <TeacherPageHeader
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
        {() => (
          <AddStudentForm
            isSaving={isSaving}
            isChecking={isChecking}
            onCancel={() => navigate(backPath)}
            onLookup={handleLookup}
            onSubmit={handleSubmit}
          />
        )}
      </ClassWriteGuard>
    </TeacherScreen>
  );
}
