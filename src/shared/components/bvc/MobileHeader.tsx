import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "back" | "close";
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  // dark: nền xanh đậm như header ứng dụng (màn luyện tập toàn màn hình)
  tone?: "light" | "dark";
}

export function MobileHeader({
  title,
  subtitle,
  variant = "back",
  onBack,
  rightSlot,
  tone = "light",
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));
  const isDark = tone === "dark";

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-[8px] px-[14px] pb-[10px]",
        isDark ? "bg-bvc-ink pt-[max(env(safe-area-inset-top),18px)] pb-3 text-white" : "pt-[26px]"
      )}
    >
      <button
        type="button"
        aria-label="Quay lại"
        onClick={handleBack}
        className={cn(
          "flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
          isDark
            ? "border border-white/25 bg-white/10 text-white hover:bg-white/20"
            : "text-bvc-ink hover:bg-bvc-surface"
        )}
      >
        {variant === "close" ? <X size={20} strokeWidth={1.8} /> : <ChevronLeft size={21} strokeWidth={1.8} />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
        <div
          className={cn(
            "truncate font-bvc-display text-[18px] leading-tight font-semibold tracking-[-0.02em]",
            isDark ? "text-white" : "text-bvc-ink"
          )}
        >
          {title}
        </div>
        {subtitle && <div className={cn("text-[12px]", isDark ? "text-white/70" : "text-bvc-muted")}>{subtitle}</div>}
      </div>

      {rightSlot}
    </header>
  );
}
