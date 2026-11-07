import { Link, useParams } from "react-router-dom";
import { AudioLines } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

// M01-14 Phân tích bài nhạc (phách, hợp âm, tông, lời): BE chưa có API trả kết quả phân tích cho sinh viên
export function SongAnalysisPage() {
  const { songId = "" } = useParams();

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-4 pb-8 md:px-14 md:pt-8">
        <div className="flex flex-col gap-1">
          <PageTitle>Phân tích bài nhạc</PageTitle>
        </div>

        <EmptyState
          icon={<AudioLines className="size-8" strokeWidth={1.5} />}
          title="Chưa có dữ liệu phân tích"
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
