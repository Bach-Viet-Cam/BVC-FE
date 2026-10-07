import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Repeat, Gauge, StepForward } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import type { PracticeMode } from "@/features/practice/types/practiceTypes";

// ── Mode definitions ──────────────────────────────────────────────────────────

interface ModeOption {
  value: PracticeMode;
  label: string;
  description: string;
  Icon: React.ElementType;
}

const MODES: ModeOption[] = [
  {
    value: "full",
    label: "Toàn bài",
    description: "Luyện từ đầu đến cuối theo nhịp thực",
    Icon: Music,
  },
  {
    value: "section",
    label: "Luyện đoạn",
    description: "Chọn bar range, loop tự động",
    Icon: Repeat,
  },
  {
    value: "slow",
    label: "Chậm 70%",
    description: "Phát chậm lại để theo kịp",
    Icon: Gauge,
  },
  {
    value: "step",
    label: "Từng nốt",
    description: "Dừng tại mỗi nốt cho đến khi bạn chơi đúng",
    Icon: StepForward,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function ModesPage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<PracticeMode>("full");

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="back"
          title="Chọn chế độ luyện"
          subtitle="Lý ngựa ô"
        />

        {/* Mode cards */}
        <div className="flex-1 overflow-y-auto pb-[24px]">
          <div className="mx-[14px] mt-3 space-y-3">
            {MODES.map(({ value, label, description, Icon }) => {
              const isActive = activeMode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveMode(value)}
                  className={`flex w-full cursor-pointer items-center gap-[14px] rounded-[20px] border p-[16px] text-left transition-colors ${
                    isActive
                      ? "border-bvc-accent bg-bvc-accent-tint"
                      : "border-bvc-border bg-white"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex size-[44px] shrink-0 items-center justify-center rounded-[14px] ${
                      isActive ? "bg-bvc-accent" : "bg-bvc-surface"
                    }`}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      color={isActive ? "white" : "var(--color-bvc-ink)"}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[2px]">
                    <span
                      className={`text-[15px] font-bold ${
                        isActive ? "text-bvc-accent-text" : "text-bvc-ink"
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-[13px] leading-snug ${
                        isActive ? "text-bvc-accent-text" : "text-bvc-muted"
                      }`}
                    >
                      {description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 px-[14px] pb-[24px] pt-[10px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-bvc-ink text-[15px] font-bold text-white"
          >
            Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
}
