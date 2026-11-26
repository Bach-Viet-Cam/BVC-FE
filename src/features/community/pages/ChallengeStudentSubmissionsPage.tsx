import { useNavigate, useParams } from "react-router-dom";
import { StudentSubmissionGrid } from "@/features/classes/components/StudentSubmissionGrid";
import { useChallengeStudentSubmissions } from "@/features/community/hooks/useChallengeStudentSubmissions";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

// Lecturer listens to each attempt a student sent to a challenge (challenges have no comment flow).
export function ChallengeStudentSubmissionsPage() {
  const navigate = useNavigate();
  const { challengeId = "", studentId = "" } = useParams<{ challengeId: string; studentId: string }>();
  const { result, isLoading, error, reload } = useChallengeStudentSubmissions(challengeId, studentId);

  const student = result?.student;
  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={student?.fullName ?? "Bài nộp"}
        subtitle={student?.studentCode ? `${student.studentCode} · Bài nộp thử thách` : "Bài nộp thử thách"}
        onBack={() => navigate(`/teacher/challenges/${challengeId}`)}
      />
      <div className="flex flex-col gap-[10px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <StudentSubmissionGrid result={result} isLoading={isLoading} error={error} reload={reload} />
      </div>
    </TeacherScreen>
  );
}
