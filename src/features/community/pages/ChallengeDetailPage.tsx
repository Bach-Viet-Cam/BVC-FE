import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M04 Chi tiết thử thách (sinh viên): BE chưa có API cho sinh viên xem yêu cầu và top người tham gia
export function ChallengeDetailPage() {
  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-14 md:pt-8">
        <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
          Chi tiết thử thách
        </h1>

        <EmptyState
          icon={<Trophy className="size-8" strokeWidth={1.5} />}
          title="Không tìm thấy thử thách"
          description="Thông tin thử thách sẽ hiện ở đây khi hệ thống mở tính năng thử thách cho sinh viên."
          actions={
            <Link to="/community/challenges" className={actionButtonClass("primary", "md", "hover:text-white")}>
              Về danh sách thử thách
            </Link>
          }
        />
      </div>
    </StudentShell>
  );
}
