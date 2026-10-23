import { centsColor } from "@/features/practice/utils/tunerColor";

interface CentsMeterProps {
  cents: number;
  live: boolean;
  size?: "compact" | "large";
}

export function CentsMeter({ cents, live, size = "compact" }: CentsMeterProps) {
  const clamped = Math.max(-50, Math.min(50, cents));
  const pct = 50 + clamped;
  const color = centsColor(cents, live);
  const large = size === "large";

  const trackH = 8;
  const markH = large ? 44 : 16;
  const tickH = large ? 28 : 14;
  const fillH = large ? 16 : 8;

  return (
    <div className="flex flex-col gap-[5px]">
      <div
        className="relative rounded-full bg-bvc-border"
        style={{ height: trackH, marginTop: large ? 24 : 3, marginBottom: large ? 20 : 3 }}
      >
        <span
          className="absolute left-1/2 -ml-px w-0.5 bg-bvc-bar-strong"
          style={{ height: tickH, top: (trackH - tickH) / 2 }}
        />
        {live && (
          <span
            className="absolute rounded-full transition-[left,width] duration-200 ease-out"
            style={{
              height: fillH,
              top: (trackH - fillH) / 2,
              backgroundColor: color,
              left: `${Math.min(50, pct)}%`,
              width: `${Math.abs(clamped)}%`,
            }}
          />
        )}
        <span
          className="absolute rounded-[2px] transition-[left] duration-200 ease-out"
          style={{
            left: `${pct}%`,
            top: (trackH - markH) / 2,
            width: large ? 6 : 4,
            height: markH,
            transform: "translateX(-50%)",
            backgroundColor: live ? color : "var(--color-bvc-faint)",
          }}
        />
      </div>
      <div className="flex justify-between text-bvc-faint" style={{ fontSize: large ? 12 : 11 }}>
        <span>−50¢</span>
        <span>0</span>
        <span>+50¢</span>
      </div>
    </div>
  );
}
