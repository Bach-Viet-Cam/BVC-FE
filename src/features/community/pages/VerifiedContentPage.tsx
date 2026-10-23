import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M04 Nội dung đã xác minh: BE chưa có API danh sách / bỏ xác minh nội dung cộng đồng
export function VerifiedContentPage() {
  return (
    <TeacherScreen>
      <DesktopPageHeader breadcrumb="Quản lý nội dung cộng đồng" title="Nội dung đã xác minh" />
      <div className="px-[18px] py-[20px] md:px-[32px]">
        <EmptyState
          icon={<BadgeCheck className="size-8" strokeWidth={1.5} />}
          title="Chưa có nội dung đã xác minh"
          description="Bản thu, bản nhạc và bản phối được xác minh sẽ hiện ở đây khi hệ thống mở tính năng nội dung cộng đồng."
          actions={
            <Link to="/leaderboard" className={actionButtonClass("primary", "md", "hover:text-white")}>
              Xem bảng xếp hạng
            </Link>
          }
        />
      </div>
    </TeacherScreen>
  );
}
