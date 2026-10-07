import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

// ── Types & mock data ─────────────────────────────────────────────────────────

type RungStatus = "completed" | "current" | "upcoming";

interface TempoRung {
  step: number;
  bpm: number;
  status: RungStatus;
}

const TEMPO_RUNGS: TempoRung[] = [
  { step: 1, bpm: 50, status: "completed" },
  { step: 2, bpm: 60, status: "completed" },
  { step: 3, bpm: 70, status: "current" },
  { step: 4, bpm: 80, status: "upcoming" },
  { step: 5, bpm: 84, status: "upcoming" },
];

const TOTAL_PASSES = 5;
const DONE_PASSES = 2;

// ─────────────────────────────────────────────────────────────────────────────

function rungClasses(status: RungStatus): string {
  if (status === "completed")
    return "bg-[#EBF5EE] text-bvc-ok border border-transparent";
  if (status === "current")
    return "bg-bvc-accent-tint text-bvc-accent-text border border-bvc-accent";
  return "bg-white text-bvc-faint border border-bvc-border";
}

function rungLabelColor(status: RungStatus): string {
  if (status === "completed") return "text-bvc-ok";
  if (status === "current") return "text-bvc-accent-text";
  return "text-bvc-faint";
}

export function SectionPage() {
  const navigate = useNavigate();
  const [startBar, setStartBar] = useState(18);
  const [endBar, setEndBar] = useState(24);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="back"
          title="Luyện đoạn 18–24"
          subtitle="Slow build · Bar 18–24"
        />

        <div className="flex-1 overflow-y-auto pb-[24px]">

          {/* Bar range selector */}
          <div className="mx-[14px] rounded-[20px] border border-bvc-border p-[14px]">
            <div className="flex items-center gap-[16px]">
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-[13px] text-bvc-muted">Bar bắt đầu</label>
                <input
                  type="number"
                  value={startBar}
                  onChange={(e) => setStartBar(Number(e.target.value))}
                  className="h-[40px] w-full rounded-[12px] border border-bvc-border-strong bg-bvc-surface px-[12px] font-bvc-mono text-[16px] font-semibold text-bvc-ink outline-none focus:border-bvc-accent"
                />
              </div>
              <span className="mt-[22px] text-[14px] text-bvc-faint">–</span>
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-[13px] text-bvc-muted">Bar kết thúc</label>
                <input
                  type="number"
                  value={endBar}
                  onChange={(e) => setEndBar(Number(e.target.value))}
                  className="h-[40px] w-full rounded-[12px] border border-bvc-border-strong bg-bvc-surface px-[12px] font-bvc-mono text-[16px] font-semibold text-bvc-ink outline-none focus:border-bvc-accent"
                />
              </div>
            </div>
          </div>

          {/* Tempo ladder */}
          <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[14px]">
            <p className="mb-[14px] text-[15px] font-bold text-bvc-ink">
              Thang tốc độ
            </p>
            <div className="flex flex-col gap-[10px]">
              {TEMPO_RUNGS.map((rung) => (
                <div
                  key={rung.step}
                  className={`flex items-center gap-[12px] rounded-[14px] px-[14px] py-[12px] ${rungClasses(rung.status)}`}
                >
                  {/* Step circle */}
                  <div
                    className={`flex size-[28px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      rung.status === "completed"
                        ? "bg-bvc-ok text-white"
                        : rung.status === "current"
                          ? "bg-bvc-accent text-white"
                          : "bg-bvc-border text-bvc-faint"
                    }`}
                  >
                    {rung.step}
                  </div>

                  {/* BPM */}
                  <span
                    className={`flex-1 font-bvc-mono text-[15px] font-semibold ${rungLabelColor(rung.status)}`}
                  >
                    {rung.bpm} BPM
                  </span>

                  {/* Status label */}
                  {rung.status === "completed" && (
                    <span className="text-[12px] font-semibold text-bvc-ok">
                      Xong
                    </span>
                  )}
                  {rung.status === "current" && (
                    <span className="text-[12px] font-semibold text-bvc-accent-text">
                      Hiện tại
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    aria-label="Xóa bước"
                    className="flex size-[24px] cursor-pointer items-center justify-center rounded-full border border-bvc-border text-bvc-faint"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current step info */}
          <div className="mx-[14px] mt-3 rounded-[18px] bg-bvc-surface p-[14px]">
            <p className="text-[15px] font-bold text-bvc-ink">
              Bước 3 / 5 · 70 BPM
            </p>
            <p className="mt-[3px] text-[13px] text-bvc-muted">
              Hoàn thành 2 lần để tiếp tục
            </p>
            {/* Progress dots */}
            <div className="mt-[12px] flex gap-[8px]">
              {Array.from({ length: TOTAL_PASSES }).map((_, i) => (
                <span
                  key={i}
                  className="size-[10px] rounded-full"
                  style={{
                    backgroundColor:
                      i < DONE_PASSES
                        ? "var(--color-bvc-accent)"
                        : "var(--color-bvc-border)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 px-[14px] pb-[20px] pt-[10px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-bvc-ink text-[15px] font-bold text-white"
          >
            Bắt đầu luyện 70 BPM
          </button>
        </div>
      </div>
    </div>
  );
}
