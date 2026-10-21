import { AssignmentList } from "@/features/classes/components/AssignmentList";
import { MobileAppShell } from "@/shared/components/bvc/MobileAppShell";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";

export function AssignmentListPage() {
  return (
    <MobileScreen>
      <MobileAppShell />
      <h1 className="m-0 px-[18px] pt-[16px] text-[25px] font-extrabold tracking-[-0.025em]">Bài tập</h1>
      <AssignmentList canCreate />
    </MobileScreen>
  );
}
