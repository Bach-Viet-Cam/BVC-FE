interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--color-bvc-ok)";
  if (score >= 60) return "var(--color-bvc-warn)";
  return "var(--color-bvc-error)";
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
}: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  const cx = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--color-bvc-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-bvc-mono text-[28px] font-semibold leading-none"
          style={{ color }}
        >
          {score}%
        </span>
        {label && (
          <span className="mt-[3px] text-[12px] font-bold text-bvc-ink">{label}</span>
        )}
        {sublabel && (
          <span className="text-[11px] text-bvc-muted">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
