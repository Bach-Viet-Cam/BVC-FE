import { useState } from "react";
import { Mic, Volume1, Volume2, VolumeX } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  MobileHeader,
  Waveform,
} from "@/shared/components/bvc";

const WAVEFORM_BARS = Array.from({ length: 40 }, (_, i) => {
  const heights = [
    30, 45, 60, 75, 50, 80, 35, 55, 70, 40,
    65, 25, 80, 50, 45, 70, 60, 35, 55, 75,
    40, 65, 30, 50, 70, 45, 80, 35, 60, 50,
    75, 40, 55, 65, 30, 70, 45, 80, 50, 35,
  ];
  return { h: heights[i] ?? 40 };
});

export function EnsemblePage() {
  const { sessionId: _sessionId } = useParams<{ sessionId: string }>();
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Hòa tấu"
          subtitle="Trống cơm · Nhóm 3 · W4"
          variant="close"
        />

        {/* Session status bar */}
        <div className="mx-[14px] mt-3 flex items-center gap-[10px] rounded-[18px] bg-bvc-surface p-[12px]">
          <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-bvc-ok" />
          <span className="flex-1 text-[14px] font-bold text-bvc-ok">
            Đang phiên · 3/4 thành viên
          </span>
          <span className="font-bvc-mono text-[13px] text-bvc-muted">10:23</span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Tracks section */}
          <div className="mx-[14px] mt-3 space-y-2">
            <div className="text-[12px] font-bold uppercase tracking-wide text-bvc-muted">
              Bè nhạc
            </div>

            {/* Track: Đàn tranh — YOUR PART */}
            <div className="flex items-center rounded-[16px] border border-bvc-border bg-white p-[11px_12px] gap-[10px]">
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-bvc-ok text-[12px] font-bold text-white">
                TM
              </span>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-[14px] font-bold text-bvc-ink">Đàn tranh</span>
                <span className="text-[12px] text-bvc-muted">Bè 1</span>
              </div>
              <Volume2 size={18} strokeWidth={2.2} className="text-bvc-ink shrink-0" />
            </div>

            {/* Track: Đàn bầu */}
            <div className="flex items-center rounded-[16px] border border-bvc-border bg-white p-[11px_12px] gap-[10px]">
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-bvc-bar text-[12px] font-bold text-bvc-muted">
                KL
              </span>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-[14px] font-bold text-bvc-ink">Đàn bầu</span>
                <span className="text-[12px] text-bvc-muted">Bè 2</span>
              </div>
              <VolumeX size={18} strokeWidth={1.8} className="text-bvc-faint shrink-0" />
            </div>

            {/* Track: Đàn nhị */}
            <div className="flex items-center rounded-[16px] border border-bvc-border bg-white p-[11px_12px] gap-[10px]">
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-bvc-bar text-[12px] font-bold text-bvc-muted">
                NH
              </span>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-[14px] font-bold text-bvc-ink">Đàn nhị</span>
                <span className="text-[12px] text-bvc-muted">Bè 3</span>
              </div>
              <Volume1 size={18} strokeWidth={1.8} className="text-bvc-faint shrink-0" />
            </div>

            {/* Track: Đàn tỳ bà */}
            <div className="flex items-center rounded-[16px] border border-bvc-border bg-white p-[11px_12px] gap-[10px]">
              <span
                className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ backgroundColor: "var(--color-bvc-warn)" }}
              >
                GH
              </span>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-[14px] font-bold text-bvc-ink">Đàn tỳ bà</span>
                <span className="text-[12px] text-bvc-muted">Bè 4</span>
              </div>
              <Volume2 size={18} strokeWidth={1.8} className="text-bvc-faint shrink-0" />
            </div>

            {/* Percussion row */}
            <div className="flex items-center justify-between rounded-[16px] bg-bvc-ink p-[11px_12px]">
              <span className="text-[14px] font-bold text-white">🥁 Bộ gõ · BPM 84</span>
              <span className="text-[12px] text-bvc-faint">Đang phát</span>
            </div>
          </div>

          {/* Your recording section */}
          <div className="mx-[14px] mt-4 mb-4">
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-bvc-muted">
              Phần của bạn
            </div>
            <Waveform
              bars={WAVEFORM_BARS}
              height={40}
              defaultColor="var(--color-bvc-accent)"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bvc-mono text-[12px] text-bvc-muted">
                Bar 18 · phách 3
              </span>
              <span className="font-bvc-mono text-[12px] text-bvc-muted">
                Đã thu 0:42
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-[14px] pb-5 pt-3">
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="flex h-[48px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong text-[14px] font-semibold text-bvc-ink"
            >
              Dừng hòa tấu
            </button>

            <button
              type="button"
              onClick={() => setIsRecording((v) => !v)}
              className="flex h-[72px] w-[72px] shrink-0 cursor-pointer items-center justify-center rounded-full border-[5px] border-bvc-accent-tint"
              style={{ backgroundColor: "var(--color-bvc-accent)" }}
              aria-label="Ghi âm"
            >
              <Mic
                size={26}
                strokeWidth={2}
                className={isRecording ? "text-white opacity-60" : "text-white"}
              />
            </button>

            <button
              type="button"
              className="flex h-[48px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong text-[14px] font-semibold text-bvc-ink"
            >
              Phát lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
