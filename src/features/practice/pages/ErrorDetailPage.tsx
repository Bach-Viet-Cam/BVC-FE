import { useState } from "react";
import { Play } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { Waveform } from "@/shared/components/bvc/Waveform";

// ── Mock waveform data ────────────────────────────────────────────────────────

const SAMPLE_BARS = [
  45, 50, 55, 70, 65, 80, 75, 60, 68, 72, 85, 90, 78, 65, 70, 55, 48, 52, 45,
  40, 58, 63, 70, 75, 80, 85, 75, 65, 60, 55, 48, 44, 50, 55, 60, 58, 52, 45,
  40, 35,
].map((h) => ({ h, color: "var(--color-bvc-bar)" }));

// User recording bars: mix of bvc-bar-strong (normal) and bvc-error (wrong)
const USER_BARS = [
  { h: 42, color: "var(--color-bvc-bar-strong)" },
  { h: 56, color: "var(--color-bvc-bar-strong)" },
  { h: 48, color: "var(--color-bvc-error)" },
  { h: 76, color: "var(--color-bvc-error)" },
  { h: 70, color: "var(--color-bvc-bar-strong)" },
  { h: 85, color: "var(--color-bvc-bar-strong)" },
  { h: 80, color: "var(--color-bvc-error)" },
  { h: 64, color: "var(--color-bvc-bar-strong)" },
  { h: 72, color: "var(--color-bvc-error)" },
  { h: 78, color: "var(--color-bvc-bar-strong)" },
  { h: 88, color: "var(--color-bvc-bar-strong)" },
  { h: 95, color: "var(--color-bvc-error)" },
  { h: 82, color: "var(--color-bvc-bar-strong)" },
  { h: 68, color: "var(--color-bvc-bar-strong)" },
  { h: 74, color: "var(--color-bvc-error)" },
  { h: 58, color: "var(--color-bvc-bar-strong)" },
  { h: 52, color: "var(--color-bvc-bar-strong)" },
  { h: 56, color: "var(--color-bvc-error)" },
  { h: 48, color: "var(--color-bvc-bar-strong)" },
  { h: 44, color: "var(--color-bvc-bar-strong)" },
  { h: 62, color: "var(--color-bvc-bar-strong)" },
  { h: 66, color: "var(--color-bvc-error)" },
  { h: 74, color: "var(--color-bvc-bar-strong)" },
  { h: 78, color: "var(--color-bvc-bar-strong)" },
  { h: 84, color: "var(--color-bvc-error)" },
  { h: 88, color: "var(--color-bvc-bar-strong)" },
  { h: 78, color: "var(--color-bvc-bar-strong)" },
  { h: 68, color: "var(--color-bvc-bar-strong)" },
  { h: 63, color: "var(--color-bvc-error)" },
  { h: 58, color: "var(--color-bvc-bar-strong)" },
  { h: 50, color: "var(--color-bvc-bar-strong)" },
  { h: 46, color: "var(--color-bvc-bar-strong)" },
  { h: 52, color: "var(--color-bvc-error)" },
  { h: 58, color: "var(--color-bvc-bar-strong)" },
  { h: 63, color: "var(--color-bvc-bar-strong)" },
  { h: 60, color: "var(--color-bvc-bar-strong)" },
  { h: 54, color: "var(--color-bvc-error)" },
  { h: 47, color: "var(--color-bvc-bar-strong)" },
  { h: 42, color: "var(--color-bvc-bar-strong)" },
  { h: 38, color: "var(--color-bvc-bar-strong)" },
];

// ─────────────────────────────────────────────────────────────────────────────

export function ErrorDetailPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="back"
          title="Chi tiết lỗi"
          subtitle="Bar 18–24"
        />

        <div className="flex-1 overflow-y-auto pb-[24px]">

          {/* Card 1 — Sample */}
          <div className="relative mx-[14px] overflow-hidden rounded-[20px] border border-bvc-border p-[14px]">
            <div className="mb-[10px] flex items-center justify-between">
              <span className="text-[14px] font-bold text-bvc-ink">Bản mẫu</span>
              <span className="font-bvc-mono text-[12px] text-bvc-muted">
                84 BPM · Bar 18–24
              </span>
            </div>
            <div className="relative">
              <Waveform bars={SAMPLE_BARS} height={48} />
              {/* Playhead at ~30% */}
              <div
                className="pointer-events-none absolute inset-y-0"
                style={{
                  left: "30%",
                  width: 2,
                  backgroundColor: "var(--color-bvc-accent)",
                }}
              />
            </div>
          </div>

          {/* Card 2 — User recording */}
          <div className="mx-[14px] mt-[10px] rounded-[20px] border border-bvc-border p-[14px]">
            <div className="mb-[10px] flex items-center justify-between">
              <span className="text-[14px] font-bold text-bvc-accent-text">
                Bản thu của bạn
              </span>
              <span className="font-bvc-mono text-[12px] text-bvc-muted">
                91 BPM avg
              </span>
            </div>
            <Waveform bars={USER_BARS} height={48} />
            <div className="mt-[8px]">
              <span
                className="font-bvc-mono text-[12px] font-semibold"
                style={{ color: "var(--color-bvc-warn)" }}
              >
                -42ms lệch phách
              </span>
            </div>
          </div>

          {/* Play controls row */}
          <div className="mx-[14px] mt-3 flex items-center gap-[10px]">
            {/* Play button */}
            <button
              type="button"
              aria-label={isPlaying ? "Dừng" : "Phát"}
              onClick={() => setIsPlaying((v) => !v)}
              className="flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-accent"
            >
              <Play size={20} color="white" strokeWidth={2} />
            </button>

            {/* Progress bar */}
            <div className="relative h-[5px] flex-1 rounded-full bg-bvc-border">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-bvc-ink"
                style={{ width: "38%" }}
              />
            </div>

            {/* Time */}
            <span className="shrink-0 font-bvc-mono text-[12px] text-bvc-muted">
              1:02 / 2:41
            </span>

            {/* So sánh */}
            <button
              type="button"
              className="shrink-0 cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
            >
              So sánh
            </button>
          </div>

          {/* Tip card */}
          <div className="mx-[14px] mt-3 rounded-[18px] bg-bvc-surface p-[14px]">
            <p className="mb-[6px] text-[14px] font-bold text-bvc-ink">
              Gợi ý
            </p>
            <p className="text-[13px] leading-relaxed text-bvc-muted">
              Luyện riêng Bar 18–24 ở tốc độ 50 BPM. Tập chú ý vào nốt đầu mỗi
              phách — đây là điểm nhấn chính. Tăng dần lên 70, 80, rồi 84 BPM
              khi cảm thấy tự tin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
