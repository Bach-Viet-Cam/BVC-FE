import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";

export function SheetPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(2);
  const totalPages = 3;

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Bản nhạc"
          subtitle="Lý ngựa ô · Đàn tranh"
          rightSlot={
            <span className="shrink-0 font-bvc-mono text-[13px] text-bvc-muted">
              trang {currentPage}/{totalPages}
            </span>
          }
        />

        {/* Sheet area - no scroll */}
        <div className="mx-[14px] flex flex-1 items-center justify-center overflow-hidden rounded-[18px] bg-bvc-surface">
          <div className="flex flex-col items-center">
            <Music size={40} className="text-bvc-bar" strokeWidth={1.5} />
            <p className="mt-2 text-[14px] text-bvc-muted">
              Bản nhạc đang tải
            </p>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="shrink-0 flex items-center gap-3 px-[14px] pb-5 pt-3">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border text-[14px] font-semibold text-bvc-ink disabled:opacity-40"
          >
            ← Trang trước
          </button>

          <span className="font-bvc-mono shrink-0 text-center text-[15px] font-bold text-bvc-ink">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border text-[14px] font-semibold text-bvc-ink disabled:opacity-40"
          >
            Trang sau →
          </button>

          <button
            type="button"
            onClick={() => navigate("/practice/ly-ngua-o")}
            className="flex h-[44px] shrink-0 cursor-pointer items-center rounded-[14px] bg-bvc-accent px-[16px] text-[14px] font-bold text-white"
          >
            Luyện
          </button>
        </div>
      </div>
    </div>
  );
}
