import { useNavigate } from "react-router-dom";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { Waveform } from "@/shared/components/bvc/Waveform";
import { ScoreBar } from "@/shared/components/bvc/ScoreBar";

// ── Mock data ─────────────────────────────────────────────────────────────────

function makeMiniWave(seed: number): { h: number; color?: string }[] {
  return Array.from({ length: 30 }, (_, i) => ({
    h: 20 + ((seed * 17 + i * 13) % 55),
    color: "var(--color-bvc-bar)",
  }));
}

interface RecordingSnapshot {
  id: string;
  label: string;
  dateLine: string;
  score: number;
  pitch: number;
  rhythm: number;
  highlighted: boolean;
}

const RECORDINGS: RecordingSnapshot[] = [
  {
    id: "3",
    label: "#3",
    dateLine: "Hôm nay",
    score: 82,
    pitch: 88,
    rhythm: 74,
    highlighted: true,
  },
  {
    id: "2",
    label: "#2",
    dateLine: "Hôm qua, 19:05",
    score: 78,
    pitch: 82,
    rhythm: 66,
    highlighted: false,
  },
  {
    id: "1",
    label: "#1",
    dateLine: "2 ngày trước, 10:22",
    score: 71,
    pitch: 74,
    rhythm: 68,
    highlighted: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function ComparePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="back"
          title="So sánh bản thu"
          subtitle="Lý ngựa ô"
        />

        <div className="flex-1 overflow-y-auto pb-[24px]">
          <div className="mt-3 flex flex-col gap-[10px] px-[14px]">

            {RECORDINGS.map((rec, idx) => (
              <div
                key={rec.id}
                className={`rounded-[20px] border p-[14px] ${
                  rec.highlighted
                    ? "border-bvc-accent"
                    : "border-bvc-border"
                }`}
                style={
                  rec.highlighted
                    ? { backgroundColor: "rgba(254,238,231,0.3)" }
                    : { backgroundColor: "white" }
                }
              >
                {/* Header row */}
                <div className="mb-[10px] flex items-center justify-between">
                  <span className="text-[14px] font-bold text-bvc-ink">
                    {rec.label} · {rec.dateLine}
                  </span>
                  <span
                    className="font-bvc-mono text-[14px] font-semibold text-bvc-ok"
                  >
                    {rec.score}%
                  </span>
                </div>

                {/* Mini waveform */}
                <Waveform bars={makeMiniWave(idx + 1)} height={20} />

                {/* Score bars */}
                <div className="mt-[10px] flex flex-col gap-[8px]">
                  <ScoreBar label="Cao độ" score={rec.pitch} />
                  <ScoreBar label="Nhịp" score={rec.rhythm} />
                </div>

                {/* Detail link */}
                <div className="mt-[10px] text-right">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))}

            {/* Improvement note */}
            <div className="rounded-[16px] bg-bvc-surface p-[13px]">
              <p className="text-[13px] font-medium text-bvc-muted">
                Bản #2 (78%) → #3 (82%): Nhịp cải thiện +8%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
