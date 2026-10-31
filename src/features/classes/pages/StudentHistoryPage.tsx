import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { StudentSubmissionGrid } from "@/features/classes/components/StudentSubmissionGrid";
import { useAssignmentList } from "@/features/classes/hooks/useAssignmentList";
import { useStudentSubmissions } from "@/features/classes/hooks/useStudentSubmissions";
import { type AssignmentKind } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

const KIND_ORDER: AssignmentKind[] = ["SOLO", "ENSEMBLE", "BONUS", "OTHER"];

// Submission history of one student in a class (opened from "Sinh viên cần chú ý"): one tab per
// published assignment, each tab is the same listen-and-comment flow as the assignment's student page.
export function StudentHistoryPage() {
  const navigate = useNavigate();
  // Opened from the home card or from the "Sinh viên cần chú ý" list: back returns there.
  const backPath = (useLocation().state as { from?: string } | null)?.from ?? "/teacher/home";
  const { classId = "", studentId = "" } = useParams<{ classId: string; studentId: string }>();
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  const assignmentList = useAssignmentList({ classId });
  const assignments = (assignmentList.result?.items ?? [])
    .filter((item) => item.status !== "DRAFT")
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const selected = assignments.find((item) => item.id === assignmentId) ?? assignments[0] ?? null;

  const submissions = useStudentSubmissions(selected?.id ?? null, studentId);
  // The query keeps the previous tab's data while the new tab loads; hide it so the cards never mix
  // assignments, but keep it on the reload after saving a comment (it would drop unsent text).
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (selected && !submissions.isLoading && loadedFor !== selected.id) setLoadedFor(selected.id);
  const result = selected && loadedFor === selected.id ? submissions.result : null;
  const student = submissions.result?.student;
  const className = assignments[0]?.className;

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={student?.fullName ?? "Lịch sử nộp bài"}
        subtitle={[student?.studentCode, className, "Lịch sử nộp bài"].filter(Boolean).join(" · ")}
        onBack={() => navigate(backPath)}
      />
      <div className="flex flex-col gap-[14px] px-[18px] pb-[22px] lg:px-[32px] lg:pt-[22px]">
        <ListState
          isLoading={assignmentList.isLoading}
          error={assignmentList.error}
          isEmpty={assignments.length === 0}
          emptyMessage="Lớp chưa có bài tập nào đã đăng."
          onRetry={assignmentList.reload}
        >
          {selected && (
            <>
              <PillTabs
                label="Bài tập"
                tabs={assignments.map((item) => ({
                  value: item.id,
                  label: `${ASSIGNMENT_KIND_LABELS[item.kind]} · ${item.title}`,
                }))}
                value={selected.id}
                onChange={setAssignmentId}
              />
              <StudentSubmissionGrid
                key={selected.id}
                result={result}
                isLoading={submissions.isLoading}
                error={submissions.error}
                reload={submissions.reload}
              />
            </>
          )}
        </ListState>
      </div>
    </TeacherScreen>
  );
}
