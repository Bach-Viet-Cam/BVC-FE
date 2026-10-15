import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ClassInfoPanel } from "@/features/classes/components/ClassInfoPanel";
import { type ClassTabKey, ClassTabs } from "@/features/classes/components/ClassTabs";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { MembersTab } from "@/features/classes/components/MembersTab";
import { useClassActions } from "@/features/classes/hooks/useClassActions";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
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
    <MobileScreen>
      <MobileHeader
        title={classDetail?.name ?? "Chi tiết lớp"}
        subtitle="Chi tiết lớp"
        onBack={() => navigate("/teacher/classes")}
      />
      {!classDetail ? (
        <div className="px-[18px]">
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
          {activeTab === "members" ? (
            <MembersTab classDetail={classDetail} onMembersChanged={reload} />
          ) : (
            // Roadmap / assignments / progress tabs wait for their UI designs (sub-projects 2–4).
            <p className="m-[18px] rounded-[18px] bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
              Chức năng đang phát triển.
            </p>
          )}
          <div className="mt-auto shrink-0 border-t border-bvc-border px-[18px] pb-[24px] pt-[12px] text-[12.5px] leading-[1.5] text-bvc-muted">
            Cả lớp học {classDetail.instrument.name.toLowerCase()}, không chia nhóm.
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
        </>
      )}
    </MobileScreen>
  );
}
