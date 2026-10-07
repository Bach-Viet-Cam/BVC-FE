const STATUS_COLORS = {
  ok: "var(--color-bvc-ok)",
  warn: "var(--color-bvc-warn)",
  error: "var(--color-bvc-error)",
  muted: "var(--color-bvc-bar-strong)",
} as const;

interface StatusDotProps {
  status: keyof typeof STATUS_COLORS;
  label?: string;
  size?: number;
}

export function StatusDot({ status, label, size = 8 }: StatusDotProps) {
  const color = STATUS_COLORS[status];
  return (
    <span className="flex items-center gap-[6px]">
      <span
        className="shrink-0 rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
      {label && (
        <span className="text-[13.5px] font-bold" style={{ color }}>
          {label}
        </span>
      )}
    </span>
  );
}
