import { MobileHeader } from "@/shared/components/bvc";

const NOTES = ["Đô", "Đô#", "Rê", "Rê#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
const MOCK_NOTE = { name: "Rê", scientific: "D4", freq: 291.2, cents: -12 };

function getPinColor(cents: number): string {
  if (Math.abs(cents) <= 5) return "var(--color-bvc-ok)";
  if (Math.abs(cents) <= 15) return "var(--color-bvc-warn)";
  return "var(--color-bvc-error)";
}

function getPinPosition(cents: number): string {
  const clamped = Math.max(-50, Math.min(50, cents));
  return `${50 + clamped}%`;
}

export function TunerPage() {
  const { name, scientific, freq, cents } = MOCK_NOTE;
  const color = getPinColor(cents);
  const direction = cents < 0 ? "hơi thấp" : cents > 0 ? "hơi cao" : "chuẩn";
  const offsetLabel = cents === 0 ? "chuẩn" : `${cents > 0 ? "+" : ""}${cents}¢ ${direction}`;

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Máy đo cao độ" subtitle="Lý ngựa ô · Đàn tranh" />

        {/* Main display */}
        <div className="flex flex-1 flex-col items-center justify-center gap-[32px] px-[24px]">
          {/* Large note display */}
          <div className="flex flex-col items-center gap-[8px]">
            <span
              className="font-bvc-mono text-[80px] font-semibold leading-none"
              style={{ color }}
            >
              {name}
            </span>
            <span className="font-bvc-mono text-[18px] text-bvc-muted">
              {scientific} · {freq.toFixed(1)} Hz
            </span>
            <span
              className="mt-[2px] text-[15px] font-semibold"
              style={{ color }}
            >
              {offsetLabel}
            </span>
          </div>

          {/* Large pitch track */}
          <div className="w-full">
            <div className="relative h-[16px] w-full rounded-full bg-bvc-border">
              {/* Scale marks */}
              {[-30, -20, -10, 0, 10, 20, 30].map((mark) => (
                <span
                  key={mark}
                  className="absolute top-[-6px] w-[1px] bg-bvc-bar-strong"
                  style={{
                    left: getPinPosition(mark),
                    height: mark === 0 ? 28 : 18,
                    transform: "translateX(-50%)",
                  }}
                />
              ))}
              {/* Pin */}
              <span
                className="absolute rounded-[3px]"
                style={{
                  left: getPinPosition(cents),
                  top: -6,
                  width: 6,
                  height: 28,
                  transform: "translateX(-50%)",
                  backgroundColor: color,
                }}
              />
            </div>
            <div className="mt-[6px] flex justify-between font-bvc-mono text-[11px] text-bvc-faint">
              <span>-50¢</span>
              <span>0¢</span>
              <span>+50¢</span>
            </div>
          </div>

          {/* Reference note selector */}
          <div className="w-full rounded-[20px] border border-bvc-border p-[16px]">
            <div className="mb-[10px] text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Nốt tham chiếu
            </div>
            <div className="grid grid-cols-6 gap-[6px]">
              {NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  className="cursor-pointer rounded-[10px] py-[8px] text-center text-[12px] font-semibold"
                  style={{
                    backgroundColor: note === name ? "var(--color-bvc-accent-tint)" : "var(--color-bvc-surface)",
                    color: note === name ? "var(--color-bvc-accent-text)" : "var(--color-bvc-muted)",
                    border: note === name ? "1px solid var(--color-bvc-accent)" : "none",
                  }}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* A4 reference */}
        <div className="shrink-0 flex items-center justify-between border-t border-bvc-border px-[20px] py-[14px]">
          <span className="text-[13px] text-bvc-muted">Chuẩn A4</span>
          <span className="font-bvc-mono text-[13px] font-semibold text-bvc-ink">440 Hz</span>
        </div>
      </div>
    </div>
  );
}
