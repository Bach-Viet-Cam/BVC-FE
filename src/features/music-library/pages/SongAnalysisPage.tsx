import { MobileHeader } from "@/shared/components/bvc";

type BeatType = "ok" | "warn" | "rest";

function beatColor(type: BeatType): string {
  if (type === "ok") return "var(--color-bvc-ok)";
  if (type === "warn") return "var(--color-bvc-warn)";
  return "var(--color-bvc-border)";
}

// Row 1: beat 1 of every bar (indices 0,4,8,12) = ok; odd positions = warn; even non-beat = rest
const BEAT_ROW1: BeatType[] = Array.from({ length: 16 }, (_, i) => {
  if (i === 0 || i === 4 || i === 8 || i === 12) return "ok";
  if (i % 2 === 1) return "warn";
  return "rest";
});

// Row 2: beat 3 of every bar (indices 2,6,10,14) = ok; odd = warn; else rest
const BEAT_ROW2: BeatType[] = Array.from({ length: 16 }, (_, i) => {
  if (i === 2 || i === 6 || i === 10 || i === 14) return "ok";
  if (i % 2 === 1) return "warn";
  return "rest";
});

const LYRICS = [
  { time: "0:12", text: "Ngựa ô anh khớp vô trong...", current: true },
  { time: "0:24", text: "Ngựa ô anh khớp vô trong...", current: false },
  { time: "0:36", text: "Qua cầu qua cống...", current: false },
];

const CHORD_BLOCKS = [
  { label: "Am", flex: 3 },
  { label: "Dm", flex: 2 },
  { label: "G", flex: 1 },
];

export function SongAnalysisPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Phân tích bài nhạc"
          subtitle="Lý ngựa ô"
          variant="back"
        />

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Mini stat cards */}
          <div className="mx-[14px] mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Tông", value: "Rê thứ" },
              { label: "Nhịp", value: "2/4" },
              { label: "Hợp âm", value: "Am-Dm-G" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-[4px] rounded-[16px] border border-bvc-border bg-white p-[12px_8px]"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-bvc-muted">
                  {s.label}
                </span>
                <span className="font-bvc-mono text-[13px] font-semibold text-bvc-ink">
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline card */}
          <div className="mx-[14px] mt-3 flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[14px]">
            <span className="text-[14px] font-bold text-bvc-ink">Bản đồ nhịp</span>

            {/* Beat grid 2 × 16 */}
            <div className="flex flex-col gap-1">
              <div className="grid h-8 gap-1" style={{ gridTemplateColumns: "repeat(16, 1fr)" }}>
                {BEAT_ROW1.map((type, i) => (
                  <span
                    key={`r1-${i}`}
                    className="rounded-[3px]"
                    style={{ backgroundColor: beatColor(type) }}
                  />
                ))}
              </div>
              <div className="grid h-8 gap-1" style={{ gridTemplateColumns: "repeat(16, 1fr)" }}>
                {BEAT_ROW2.map((type, i) => (
                  <span
                    key={`r2-${i}`}
                    className="rounded-[3px]"
                    style={{ backgroundColor: beatColor(type) }}
                  />
                ))}
              </div>
            </div>

            {/* Chord blocks */}
            <div className="mt-2 flex h-8 gap-1">
              {CHORD_BLOCKS.map((chord) => (
                <div
                  key={chord.label}
                  className="flex items-center justify-center rounded-sm bg-bvc-surface font-bvc-mono text-[12px] text-bvc-muted"
                  style={{ flex: chord.flex }}
                >
                  {chord.label}
                </div>
              ))}
            </div>

            <span className="font-bvc-mono text-[12px] text-bvc-muted">
              Đang phát · Bar 18
            </span>
          </div>

          {/* Lyrics card */}
          <div className="mx-[14px] mb-5 mt-3 flex flex-col gap-[8px] rounded-[20px] border border-bvc-border bg-white p-[14px]">
            <span className="text-[14px] font-bold text-bvc-ink">Lời nhạc</span>
            {LYRICS.map((line, i) => (
              <div
                key={i}
                className={
                  line.current
                    ? "flex gap-[10px] rounded-[10px] bg-bvc-accent-tint p-2"
                    : "flex gap-[10px] p-2"
                }
              >
                <span className="font-bvc-mono mt-[2px] shrink-0 text-[12px] text-bvc-muted">
                  {line.time}
                </span>
                <span
                  className="text-[14px] leading-snug"
                  style={{
                    color: line.current
                      ? "var(--color-bvc-accent-text)"
                      : "var(--color-bvc-ink)",
                    fontWeight: line.current ? 600 : undefined,
                  }}
                >
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
