import type { ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

interface PracticeTopBarProps {
  title: string;
  subtitle?: string;
  variant?: "back" | "close";
  onBack?: () => void;
  rightSlot?: ReactNode;
  // Chỉ hiện từ md: thanh trên của laptop có chỗ cho viên thuốc "Hạn nộp / Còn N lượt nộp"
  deadlineSlot?: ReactNode;
}

// Điện thoại: MobileHeader cũ. Từ md: thanh trên cao 76px của bản laptop
export function PracticeTopBar({
  title,
  subtitle,
  variant = "back",
  onBack,
  rightSlot,
  deadlineSlot,
}: PracticeTopBarProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <>
      <div className="md:hidden">
        <MobileHeader title={title} subtitle={subtitle} variant={variant} onBack={onBack} rightSlot={rightSlot} />
      </div>

      <header className="hidden h-19 shrink-0 items-center gap-4 border-b border-bvc-border bg-white px-8 md:flex">
        <button
          type="button"
          aria-label={variant === "close" ? "Đóng" : "Quay lại"}
          onClick={handleBack}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-md border border-bvc-border-strong bg-white text-bvc-ink"
        >
          {variant === "close" ? <X size={20} strokeWidth={1.8} /> : <ChevronLeft size={20} strokeWidth={1.8} />}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-bvc-display text-[21px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink">
            {title}
          </span>
          {subtitle && <span className="text-[13px] text-bvc-muted">{subtitle}</span>}
        </div>

        {deadlineSlot}
        {rightSlot}
      </header>
    </>
  );
}
