import { AssignmentList } from "@/features/classes/components/AssignmentList";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

// The lecturer navigation comes from TeacherShell (sidebar on web, top bar on phones).
export function AssignmentListPage() {
  return (
    <TeacherScreen>
      <h1 className="m-0 shrink-0 px-[18px] pt-[16px] text-[25px] font-extrabold tracking-[-0.025em] lg:border-b lg:border-bvc-border-strong lg:px-[32px] lg:pb-[18px] lg:pt-[26px] lg:font-bvc-display lg:text-[29px]">
        Bài tập
      </h1>
      <AssignmentList canCreate />
    </TeacherScreen>
  );
}
