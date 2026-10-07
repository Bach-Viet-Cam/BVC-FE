function barColor(score: number): string {
  if (score >= 80) return "var(--color-bvc-ok)";
  if (score >= 60) return "var(--color-bvc-warn)";
  return "var(--color-bvc-error)";
}

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
}

export function ScoreBar({ label, score, maxScore = 100 }: ScoreBarProps) {
  const pct = Math.round((score / maxScore) * 100);
  const color = barColor(pct);

  return (
    <div className="flex items-center gap-[10px]">
      <span className="w-[72px] shrink-0 text-[13px] text-bvc-muted">{label}</span>
      <div className="relative h-[6px] flex-1 rounded-full bg-bvc-border">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-[38px] shrink-0 text-right font-bvc-mono text-[13px] font-semibold"
        style={{ color }}
      >
        {pct}%
      </span>
    </div>
  );
}
