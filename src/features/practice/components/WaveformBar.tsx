import { Mic } from "lucide-react";
import type { MicQuality } from "@/features/practice/types/practiceTypes";

interface WaveformBarProps {
  micQuality: MicQuality;
  onRecord: () => void;
}

// Heights in %, first 36 = template (gray), last 10 = student recording (darker)
const BARS: { h: number; student?: true }[] = [
  { h: 30 }, { h: 32 }, { h: 37 }, { h: 65 }, { h: 64 }, { h: 73 }, { h: 70 },
  { h: 61 }, { h: 66 }, { h: 63 }, { h: 78 }, { h: 80 }, { h: 88 }, { h: 70 },
  { h: 55 }, { h: 47 }, { h: 53 }, { h: 34 }, { h: 41 }, { h: 35 }, { h: 30 },
  { h: 53 }, { h: 41 }, { h: 68 }, { h: 68 }, { h: 47 }, { h: 65 }, { h: 75 },
  { h: 61 }, { h: 86 }, { h: 64 }, { h: 89 }, { h: 72 }, { h: 70 }, { h: 37 },
  { h: 45 },
  { h: 50, student: true }, { h: 44, student: true }, { h: 29, student: true },
  { h: 44, student: true }, { h: 51, student: true }, { h: 43, student: true },
  { h: 39, student: true }, { h: 57, student: true }, { h: 59, student: true },
  { h: 77, student: true },
];

const STATUS_COLORS = {
  good: "var(--color-bvc-ok)",
  warning: "var(--color-bvc-warn)",
  error: "var(--color-bvc-error)",
} as const;

export function WaveformBar({ micQuality, onRecord }: WaveformBarProps) {
  const dotColor = STATUS_COLORS[micQuality.status];

  return (
    <div className="flex items-center gap-[14px] px-[14px] pb-5 pt-[14px]">
      {/* Left: status + waveform + mic info */}
      <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
        {/* Quality status */}
        <div className="flex items-center gap-[7px]">
          <span
            className="size-[8px] shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span
            className="text-[13.5px] font-bold"
            style={{ color: dotColor }}
          >
            {micQuality.label}
          </span>
        </div>

        {/* Waveform */}
        <div className="relative flex h-[26px] items-center">
          {/* Center baseline */}
          <span className="absolute inset-x-0 top-1/2 h-px bg-bvc-border" />
          {/* Bars */}
          <div className="relative flex flex-1 items-center justify-between">
            {BARS.map((bar, i) => (
              <span
                key={i}
                className="rounded-[1px]"
                style={{
                  width: 2,
                  height: `${bar.h}%`,
                  backgroundColor: bar.student
                    ? "var(--color-bvc-bar-strong)"
                    : "var(--color-bvc-bar)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Mic info */}
        <div className="text-[12.5px] text-bvc-muted">
          {micQuality.deviceLabel} · {micQuality.sampleRate} ·{" "}
          {micQuality.hasClipping ? "có clipping" : "không có clipping"}
        </div>
      </div>

      {/* Record button */}
      <button
        type="button"
        aria-label="Bắt đầu thu âm"
        onClick={onRecord}
        className="shrink-0 cursor-pointer rounded-full bg-bvc-accent text-white"
        style={{
          width: 84,
          height: 84,
          border: "5px solid var(--color-bvc-accent-tint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mic size={30} />
      </button>
    </div>
  );
}
