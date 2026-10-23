import { ClipboardCheck } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

// Duyệt nội dung cộng đồng: BE chưa có API hàng đợi duyệt nội dung do sinh viên đóng góp
export function ContentApprovalPage() {
  return (
    <TeacherScreen>
      <DesktopPageHeader breadcrumb="Quản trị" title="Duyệt nội dung cộng đồng" />
      <div className="px-[18px] py-[20px] md:px-[32px]">
        <EmptyState
          icon={<ClipboardCheck className="size-8" strokeWidth={1.5} />}
          title="Không có nội dung chờ duyệt"
          description="Nội dung sinh viên đóng góp cho cộng đồng sẽ hiện ở đây để duyệt khi hệ thống mở tính năng này."
        />
      </div>
    </TeacherScreen>
  );
}
