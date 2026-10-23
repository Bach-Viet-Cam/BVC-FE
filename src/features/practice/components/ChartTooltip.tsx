import type { ReactNode } from "react";

interface ChartTooltipProps {
  // Vị trí ngang theo % bề rộng biểu đồ; hộp được giữ trong khung
  percent: number;
  children: ReactNode;
}

const EDGE_PERCENT = 22;

// Hộp giá trị nổi trên biểu đồ; cha cần `relative`
export function ChartTooltip({ percent, children }: ChartTooltipProps) {
  const left = Math.min(100 - EDGE_PERCENT, Math.max(EDGE_PERCENT, percent));

  return (
    <div
      role="status"
      className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-bvc-border bg-white/95 px-2.5 py-1.5 text-[11px] leading-snug whitespace-nowrap text-bvc-ink shadow-sm"
      style={{ left: `${left}%` }}
    >
      {children}
    </div>
  );
}
