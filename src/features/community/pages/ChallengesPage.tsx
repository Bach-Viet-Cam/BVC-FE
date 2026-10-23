import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M04 Thử thách cộng đồng (sinh viên): BE mới có API thử thách cho giảng viên, chưa có API cho sinh viên xem và tham gia
export function ChallengesPage() {
  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-14 md:pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
            Thử thách cộng đồng
          </h1>
          <p className="text-sm text-bvc-muted md:text-[15px]">Thử thách luyện tập hằng tuần do giảng viên tạo.</p>
        </div>

        <EmptyState
          icon={<Trophy className="size-8" strokeWidth={1.5} />}
          title="Chưa có thử thách nào"
          description="Thử thách đang diễn ra và đã kết thúc sẽ hiện ở đây khi giảng viên công bố."
          actions={
            <Link to="/community/leaderboard" className={actionButtonClass("primary", "md", "hover:text-white")}>
              Xem bảng xếp hạng
            </Link>
          }
        />
      </div>
    </StudentShell>
  );
}
