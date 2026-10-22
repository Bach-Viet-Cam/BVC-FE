import { useNavigate, useParams } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { PracticeHistory } from "@/features/classes/components/PracticeHistory";
import { StudentSummaryTiles } from "@/features/classes/components/StudentSummaryTiles";
import { WeeklyAccuracyChart } from "@/features/classes/components/WeeklyAccuracyChart";
import { useStudentSummary } from "@/features/classes/hooks/useStudentSummary";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";

// UC-12 student page (spec §4): summary tiles, weekly accuracy chart, practice history.
export function StudentProgressPage() {
  const navigate = useNavigate();
  const { classId = "", studentId = "" } = useParams<{ classId: string; studentId: string }>();
  const { summary, isLoading, error, reload } = useStudentSummary(classId, studentId);

  // Reached from several screens (progress tab, progress page, members); a direct link falls back to the class.
  const handleBack = () => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (historyIndex > 0) navigate(-1);
    else navigate(`/teacher/classes/${classId}?tab=progress`);
  };

  const subtitle = summary
    ? [summary.student.studentCode, summary.class.name, summary.class.instrument.name, summary.class.cohort]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <MobileScreen>
      <MobileHeader title={summary?.student.fullName ?? "Tiến độ sinh viên"} subtitle={subtitle} onBack={handleBack} />
      <div className="flex flex-col gap-[14px] px-[18px] pb-[22px]">
        <ListState
          isLoading={isLoading && !summary}
          error={summary ? null : error}
          isEmpty={false}
          emptyMessage=""
          onRetry={reload}
        >
          {summary && (
            <div className="flex flex-col gap-[14px]">
              <StudentSummaryTiles summary={summary} />
              <WeeklyAccuracyChart weekly={summary.weekly} minAccuracy={summary.minAccuracy} />
            </div>
          )}
        </ListState>
        <PracticeHistory classId={classId} studentId={studentId} />
      </div>
    </MobileScreen>
  );
}
