import { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ClassInfoPanel } from "@/features/classes/components/ClassInfoPanel";
import { ClassProgressBoard } from "@/features/classes/components/ClassProgressBoard";
import { type ClassTabKey, ClassTabs } from "@/features/classes/components/ClassTabs";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { MembersTab } from "@/features/classes/components/MembersTab";
import { RoadmapTab } from "@/features/classes/components/RoadmapTab";
import { useClassActions } from "@/features/classes/hooks/useClassActions";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { classAssignmentsPath } from "@/features/classes/utils/teacherAssignmentFormat";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";

const TAB_KEYS: ClassTabKey[] = ["members", "roadmap", "progress"];

export function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId = "" } = useParams<{ classId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const { classDetail, setClassDetail, isLoading, error, reload } = useClassDetail(classId);
  const { endClass, isWorking } = useClassActions(classId);
  const requestedTab = searchParams.get("tab");
  const activeTab: ClassTabKey = TAB_KEYS.find((key) => key === requestedTab) ?? "members";

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

  if (requestedTab === "assignments") return <Navigate to={classAssignmentsPath(classId)} replace />;

  return (
    <TeacherScreen>
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
        <>
          <ClassInfoPanel classDetail={classDetail} onEndClass={() => setIsEndDialogOpen(true)} />
          <ClassTabs
            activeTab={activeTab}
            onChange={(tab) => setSearchParams(tab === "members" ? {} : { tab }, { replace: true })}
          />
          {activeTab === "members" && <MembersTab classDetail={classDetail} onMembersChanged={reload} />}
          {activeTab === "roadmap" && <RoadmapTab classId={classDetail.id} isClassFinished={classDetail.isReadOnly} />}
          {activeTab === "progress" && (
            <div className="px-[18px] pb-[18px] pt-[14px] lg:px-[32px] lg:pb-[24px] lg:pt-[20px]">
              <ClassProgressBoard classId={classDetail.id} />
            </div>
          )}
          <ConfirmDialog
            open={isEndDialogOpen}
            title={`Kết thúc lớp ${classDetail.name}?`}
            description="Lớp sẽ chuyển sang chỉ xem, không thể thêm thành viên hoặc bài tập."
            confirmLabel="Kết thúc lớp"
            isLoading={isWorking}
            onConfirm={confirmEndClass}
            onOpenChange={(open) => !open && setIsEndDialogOpen(false)}
          />
        </>
      )}
    </TeacherScreen>
  );
}
