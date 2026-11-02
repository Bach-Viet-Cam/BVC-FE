import { AssignmentList } from "@/features/classes/components/AssignmentList";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

// The lecturer navigation comes from TeacherShell (sidebar on web, top bar on phones).
export function AssignmentListPage() {
  return (
    <TeacherScreen>
      <PageTitle className="shrink-0 px-[18px] pt-[16px] lg:border-b lg:border-bvc-border-strong lg:px-[32px] lg:pb-[18px] lg:pt-[26px]">
        Bài tập
      </PageTitle>
      <AssignmentList canCreate />
    </TeacherScreen>
  );
}
