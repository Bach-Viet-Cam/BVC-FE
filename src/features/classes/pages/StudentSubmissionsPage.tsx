import { useNavigate, useParams } from "react-router-dom";
import { StudentSubmissionGrid } from "@/features/classes/components/StudentSubmissionGrid";
import { useStudentSubmissions } from "@/features/classes/hooks/useStudentSubmissions";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

// A15–A18: lecturer listens to each attempt and writes one comment per submission.
export function StudentSubmissionsPage() {
  const navigate = useNavigate();
  const { assignmentId = "", studentId = "" } = useParams<{ assignmentId: string; studentId: string }>();
  const { result, isLoading, error, reload } = useStudentSubmissions(assignmentId, studentId);

  const student = result?.student;
  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={student?.fullName ?? "Bài nộp"}
        subtitle={student?.studentCode ? `${student.studentCode} · Bài nộp` : "Bài nộp"}
        onBack={() => navigate(`/teacher/assignments/${assignmentId}`)}
      />
      <div className="flex flex-col gap-[10px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <StudentSubmissionGrid result={result} isLoading={isLoading} error={error} reload={reload} />
      </div>
    </TeacherScreen>
  );
}
