import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { Waveform } from "@/shared/components/bvc/Waveform";
import { StatusDot } from "@/shared/components/bvc/StatusDot";

// ── Mock waveform ─────────────────────────────────────────────────────────────

const MIC_PREVIEW_BARS = [
  20, 35, 28, 45, 38, 55, 42, 32, 50, 40, 60, 48, 36, 52, 44, 30, 58, 46, 34, 38,
].map((h) => ({ h, color: "var(--color-bvc-bar)" }));

// ─────────────────────────────────────────────────────────────────────────────

export function QualityCheckPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="close"
          title="Kiểm tra thiết bị"
          subtitle="Trước khi thu âm"
          onBack={() => navigate(-1)}
        />

        {/* Center area */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto pb-[24px]">
          {/* Mic icon circle */}
          <div className="mt-[28px] flex size-[96px] items-center justify-center rounded-full border-2 border-bvc-border bg-white">
            <Mic size={40} strokeWidth={1.6} className="text-bvc-ink" />
          </div>

          {/* Status */}
          <div className="mt-[16px]">
            <StatusDot status="ok" label="Micro đã kết nối" size={10} />
          </div>

          {/* Detail cards */}
          <div className="mt-[16px] w-full space-y-3 px-[14px]">
            {/* Card 1 — Device + waveform */}
            <div className="rounded-[18px] bg-bvc-surface p-[14px]">
              <div className="mb-[10px] flex items-center justify-between">
                <span className="text-[14px] font-bold text-bvc-ink">
                  Mic tai nghe
                </span>
                <span className="font-bvc-mono text-[12px] text-bvc-muted">
                  44.1 kHz
                </span>
              </div>
              <Waveform bars={MIC_PREVIEW_BARS} height={32} />
            </div>

            {/* Card 2 — 3 quality items */}
            <div className="rounded-[18px] bg-bvc-surface p-[14px]">
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-[4px]">
                  <span className="text-[12px] text-bvc-muted">Tiếng ồn</span>
                  <span className="text-[13px] font-bold text-bvc-ok">Thấp</span>
                </div>
                <div
                  className="h-[32px] w-px bg-bvc-border"
                  aria-hidden="true"
                />
                <div className="flex flex-col items-center gap-[4px]">
                  <span className="text-[12px] text-bvc-muted">Clipping</span>
                  <span className="text-[13px] font-bold text-bvc-ok">
                    Không
                  </span>
                </div>
                <div
                  className="h-[32px] w-px bg-bvc-border"
                  aria-hidden="true"
                />
                <div className="flex flex-col items-center gap-[4px]">
                  <span className="text-[12px] text-bvc-muted">Signal</span>
                  <span className="text-[13px] font-bold text-bvc-ink">
                    Tốt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="shrink-0 px-[14px] pb-[28px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-bvc-accent text-[15px] font-bold text-white"
          >
            Bắt đầu thu âm
          </button>
          <button
            type="button"
            className="mt-[12px] w-full cursor-pointer text-center text-[14px] font-semibold text-bvc-muted"
          >
            Đổi thiết bị
          </button>
        </div>
      </div>
    </div>
  );
}
