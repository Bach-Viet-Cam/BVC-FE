import { Link, useParams } from "react-router-dom";
import { AudioLines } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M01-14 Phân tích bài nhạc (phách, hợp âm, tông, lời): BE chưa có API trả kết quả phân tích cho sinh viên
export function SongAnalysisPage() {
  const { songId = "" } = useParams();

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-4 pb-8 md:px-14 md:pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
            Phân tích bài nhạc
          </h1>
          <p className="text-sm text-bvc-muted md:text-[15px]">Tông, nhịp, hợp âm và lời của bài nhạc.</p>
        </div>

        <EmptyState
          icon={<AudioLines className="size-8" strokeWidth={1.5} />}
          title="Chưa có dữ liệu phân tích"
          description="Kết quả phân tích của bài nhạc này sẽ hiện ở đây khi hệ thống xử lý xong."
          actions={
            <Link to={`/library/${songId}`} className={actionButtonClass("primary", "md", "hover:text-white")}>
              Về trang bài hát
            </Link>
          }
        />
      </div>
    </StudentShell>
  );
}
