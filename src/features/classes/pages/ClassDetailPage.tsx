import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AssignmentList } from "@/features/classes/components/AssignmentList";
import { ClassInfoPanel } from "@/features/classes/components/ClassInfoPanel";
import { ClassProgressBoard } from "@/features/classes/components/ClassProgressBoard";
import { type ClassTabKey, ClassTabs } from "@/features/classes/components/ClassTabs";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { MembersTab } from "@/features/classes/components/MembersTab";
import { RoadmapTab } from "@/features/classes/components/RoadmapTab";
import { useClassActions } from "@/features/classes/hooks/useClassActions";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";

const TAB_KEYS: ClassTabKey[] = ["members", "roadmap", "assignments", "progress"];

export function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId = "" } = useParams<{ classId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const { classDetail, setClassDetail, isLoading, error, reload } = useClassDetail(classId);
  const { endClass, isWorking } = useClassActions(classId);
  const requestedTab = searchParams.get("tab") as ClassTabKey | null;
  const activeTab: ClassTabKey = requestedTab && TAB_KEYS.includes(requestedTab) ? requestedTab : "members";

  const confirmEndClass = async () => {
    const outcome = await endClass();
    setIsEndDialogOpen(false);
    if ("error" in outcome) {
      toast.error(outcome.error);
      reload();
      return;
    }
    setClassDetail(outcome.data);
    toast.success(outcome.message);
  };

  return (
    <TeacherScreen className="lg:overflow-hidden">
      <TeacherPageHeader
        title={classDetail?.name ?? "Chi tiết lớp"}
        subtitle="Chi tiết lớp"
        onBack={() => navigate("/teacher/classes")}
      />
      {!classDetail ? (
        <div className="px-[18px] lg:px-[32px] lg:pt-[22px]">
          <ListState isLoading={isLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      ) : (
        // Web: class info on the left, tabs + tab content scrolling on the right. Phone: stacked.
        <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
          <aside className="flex shrink-0 flex-col lg:w-[360px] lg:overflow-y-auto lg:border-r lg:border-bvc-border-strong lg:bg-bvc-surface lg:p-[22px_20px]">
            <ClassInfoPanel classDetail={classDetail} onEndClass={() => setIsEndDialogOpen(true)} />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
            <ClassTabs
              activeTab={activeTab}
              onChange={(tab) => setSearchParams(tab === "members" ? {} : { tab }, { replace: true })}
            />
            {activeTab === "members" && <MembersTab classDetail={classDetail} onMembersChanged={reload} />}
            {activeTab === "roadmap" && (
              <RoadmapTab classId={classDetail.id} isClassFinished={classDetail.isReadOnly} />
            )}
            {activeTab === "assignments" && (
              <AssignmentList classId={classDetail.id} canCreate={!classDetail.isReadOnly} />
            )}
            {activeTab === "progress" && (
              <div className="px-[18px] pb-[18px] pt-[14px] lg:px-[32px] lg:pb-[24px] lg:pt-[20px]">
                <ClassProgressBoard classId={classDetail.id} />
              </div>
            )}
            <div className="mt-auto shrink-0 border-t border-bvc-border px-[18px] pb-[24px] pt-[12px] text-[12.5px] leading-[1.5] text-bvc-muted lg:px-[32px]">
              Cả lớp học {classDetail.instrument.name.toLowerCase()}, không chia nhóm.
            </div>
          </div>
          <ConfirmDialog
            isOpen={isEndDialogOpen}
            title={`Kết thúc lớp ${classDetail.name}?`}
            description="Lớp sẽ chuyển sang chỉ xem, không thể thêm thành viên hoặc bài tập."
            confirmLabel="Kết thúc lớp"
            isConfirming={isWorking}
            onConfirm={confirmEndClass}
            onCancel={() => setIsEndDialogOpen(false)}
          />
        </div>
      )}
    </TeacherScreen>
  );
}
