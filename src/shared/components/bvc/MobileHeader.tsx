import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "back" | "close";
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export function MobileHeader({
  title,
  subtitle,
  variant = "back",
  onBack,
  rightSlot,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header className="flex shrink-0 items-center gap-[8px] px-[14px] pb-[10px] pt-[26px]">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={handleBack}
        className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] text-bvc-ink"
      >
        {variant === "close" ? (
          <X size={20} strokeWidth={1.8} />
        ) : (
          <ChevronLeft size={21} strokeWidth={1.8} />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
        <div className="truncate text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-bvc-ink">
          {title}
        </div>
        {subtitle && (
          <div className="text-[12px] text-bvc-muted">{subtitle}</div>
        )}
      </div>

      {rightSlot}
    </header>
  );
}
