import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M01-13 Tải bài hát: BE chưa có API cho sinh viên tải bản nhạc (upload chỉ dành cho giảng viên)
export function SongUploadPage() {
  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-4 pb-8 md:px-14 md:pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
            Tải lên bản nhạc
          </h1>
          <p className="text-sm text-bvc-muted md:text-[15px]">Bản nhạc PDF hoặc MusicXML của bạn.</p>
        </div>

        <EmptyState
          icon={<Upload className="size-8" strokeWidth={1.5} />}
          title="Chưa hỗ trợ tải bản nhạc"
          description="Hiện chỉ giảng viên đăng được bản nhạc. Bạn có thể tìm bản nhạc có sẵn trong thư viện."
          actions={
            <Link to="/library" className={actionButtonClass("primary", "md", "hover:text-white")}>
              Về thư viện
            </Link>
          }
        />
      </div>
    </StudentShell>
  );
}
