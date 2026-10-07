import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StopCircle } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { Waveform } from "@/shared/components/bvc/Waveform";
import { StatusDot } from "@/shared/components/bvc/StatusDot";

// ── Mock waveform bars ────────────────────────────────────────────────────────

const RECORDING_BARS = [
  55, 70, 45, 80, 60, 75, 50, 85, 65, 90, 72, 58, 68, 82, 48, 76, 62, 88, 53,
  71, 45, 78, 63, 86, 57, 74, 42, 83, 67, 91, 54, 69, 47, 79, 61, 87, 52, 73,
  44, 81, 66, 89, 56, 77, 43, 84,
].map((h) => ({ h, color: "var(--color-bvc-accent)" }));

// ─────────────────────────────────────────────────────────────────────────────

export function RecordingPage() {
  const navigate = useNavigate();
  const [isRecording] = useState(true);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="close"
          title="Đang thu âm"
          subtitle="Lý ngựa ô · Bar 1–32"
          onBack={() => navigate(-1)}
        />

        {/* Center live area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-[20px]">
          {/* Timer */}
          <div className="flex flex-col items-center gap-[4px]">
            <span
              className="font-bvc-mono leading-none text-bvc-accent"
              style={{ fontSize: 64, fontWeight: 700 }}
            >
              0:42
            </span>
            <span className="text-[14px] font-medium text-bvc-accent-text">
              {isRecording ? "Đang ghi..." : "Đã dừng"}
            </span>
          </div>

          {/* Waveform */}
          <div className="w-full">
            <Waveform
              bars={RECORDING_BARS}
              height={64}
              defaultColor="var(--color-bvc-accent)"
            />
          </div>

          {/* Position info */}
          <span className="font-bvc-mono text-[13px] text-bvc-muted">
            BPM 72 · Bar 18 · phách 3
          </span>
        </div>

        {/* Bottom controls */}
        <div className="shrink-0 px-[20px] pb-[28px]">
          {/* Three buttons row */}
          <div className="flex items-center justify-between gap-[12px]">
            {/* Hủy */}
            <button
              type="button"
              className="flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink"
            >
              Hủy
            </button>

            {/* Stop button */}
            <button
              type="button"
              aria-label="Dừng thu âm"
              onClick={() => navigate(-1)}
              className="flex size-[72px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-ink"
              style={{ border: "5px solid var(--color-bvc-bar)" }}
            >
              <StopCircle size={28} color="white" strokeWidth={1.8} />
            </button>

            {/* Metronome */}
            <button
              type="button"
              className="flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink"
            >
              Metronome
            </button>
          </div>

          {/* Mic quality row */}
          <div className="mt-[16px] flex flex-col items-center gap-[4px]">
            <StatusDot status="ok" label="Chất lượng: tốt" size={8} />
            <span className="text-[12px] text-bvc-faint">
              Mic tai nghe · 44.1 kHz · không có clipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
