import { useState, useEffect, useRef } from "react";
import { Play, Square } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";

const TIME_SIGNATURES = ["2/4", "3/4", "4/4", "6/8"];

function bpmToInterval(bpm: number): number {
  return 60000 / bpm;
}

export function MetronomePage() {
  const [bpm, setBpm] = useState(84);
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const beatsPerBar = parseInt(timeSignature.split("/")[0], 10);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => (prev + 1) % beatsPerBar);
      }, bpmToInterval(bpm));
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentBeat(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, bpm, beatsPerBar]);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Máy đánh nhịp" subtitle="Lý ngựa ô · Đàn tranh" />

        {/* Main */}
        <div className="flex flex-1 flex-col items-center justify-center gap-[36px] px-[24px]">
          {/* BPM display */}
          <div className="flex flex-col items-center gap-[4px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-bvc-muted">BPM</span>
            <span className="font-bvc-mono text-[80px] font-semibold leading-none text-bvc-ink">{bpm}</span>
          </div>

          {/* Beat dots */}
          <div className="flex gap-[14px]">
            {Array.from({ length: beatsPerBar }).map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-colors"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor:
                    isPlaying && i === currentBeat
                      ? i === 0
                        ? "var(--color-bvc-accent)"
                        : "var(--color-bvc-ink)"
                      : "var(--color-bvc-border)",
                }}
              />
            ))}
          </div>

          {/* BPM slider */}
          <div className="w-full">
            <input
              type="range"
              min={40}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(+e.target.value)}
              className="w-full accent-[#F4622E]"
            />
            <div className="mt-[6px] flex justify-between font-bvc-mono text-[12px] text-bvc-faint">
              <span>40</span>
              <span>120</span>
              <span>200</span>
            </div>
          </div>

          {/* BPM +/- controls */}
          <div className="flex items-center gap-[20px]">
            <button
              type="button"
              onClick={() => setBpm((v) => Math.max(40, v - 1))}
              className="flex size-[48px] cursor-pointer items-center justify-center rounded-[16px] border border-bvc-border-strong bg-white text-[22px] font-bold text-bvc-ink"
            >
              −
            </button>
            <div className="flex flex-col items-center">
              <span className="font-bvc-mono text-[15px] text-bvc-muted">{timeSignature}</span>
            </div>
            <button
              type="button"
              onClick={() => setBpm((v) => Math.min(200, v + 1))}
              className="flex size-[48px] cursor-pointer items-center justify-center rounded-[16px] border border-bvc-border-strong bg-white text-[22px] font-bold text-bvc-ink"
            >
              +
            </button>
          </div>

          {/* Time signature */}
          <div className="flex w-full gap-[8px]">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                type="button"
                onClick={() => setTimeSignature(ts)}
                className="flex-1 cursor-pointer rounded-[13px] border py-[10px] text-center font-bvc-mono text-[14px] font-semibold"
                style={{
                  borderColor: ts === timeSignature ? "var(--color-bvc-accent)" : "var(--color-bvc-border-strong)",
                  backgroundColor: ts === timeSignature ? "var(--color-bvc-accent-tint)" : "white",
                  color: ts === timeSignature ? "var(--color-bvc-accent-text)" : "var(--color-bvc-ink)",
                }}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>

        {/* Play/Stop */}
        <div className="shrink-0 px-[24px] pb-[28px] pt-[16px]">
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className="flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-[16px] py-[16px] text-[16px] font-bold text-white"
            style={{ backgroundColor: isPlaying ? "var(--color-bvc-ink)" : "var(--color-bvc-accent)" }}
          >
            {isPlaying ? (
              <><Square size={20} fill="white" /> Dừng</>
            ) : (
              <><Play size={20} fill="white" /> Bắt đầu</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
