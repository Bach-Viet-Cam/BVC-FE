import { Link } from "react-router-dom";
import { UserCheck } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// Đánh giá tổng quát từng sinh viên: BE chưa có API lưu nhận xét theo sinh viên
// (nhận xét theo từng bài nộp đã có ở màn Duyệt bài nộp)
export function StudentReviewPage() {
  return (
    <TeacherScreen>
      <DesktopPageHeader breadcrumb="Lớp học" title="Đánh giá sinh viên" />
      <div className="px-[18px] py-[20px] md:px-[32px]">
        <EmptyState
          icon={<UserCheck className="size-8" strokeWidth={1.5} />}
          title="Chưa có đánh giá sinh viên"
          description="Đánh giá tổng quát cho từng sinh viên sẽ hiện ở đây khi hệ thống mở. Hiện có thể nhận xét từng bài nộp ở màn Duyệt bài nộp."
          actions={
            <>
              <Link to="/teacher/review" className={actionButtonClass("primary", "md", "hover:text-white")}>
                Duyệt bài nộp
              </Link>
              <Link to="/teacher/progress" className={actionButtonClass("secondary", "md")}>
                Xem tiến độ sinh viên
              </Link>
            </>
          }
        />
      </div>
    </TeacherScreen>
  );
}
