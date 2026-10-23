import { cn } from "@/shared/utils/cn";

// Mọi nét có pathLength=1 để dasharray/dashoffset tính theo tỉ lệ 0..1.
const STROKE = "fill-none stroke-bvc-ink [stroke-linecap:round] [stroke-linejoin:round]";
const DRAW = "[stroke-dasharray:1] animate-hp-draw motion-reduce:animate-none";
const ORIGIN = "[transform-box:fill-box] [transform-origin:center]";

export function HeadphonePlugAnimation({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-label="Cắm tai nghe vào thiết bị"
      className={cn("h-auto w-full max-w-[320px]", className)}
    >
      {/* Điện thoại */}
      <rect
        x="190"
        y="18"
        width="100"
        height="196"
        rx="22"
        strokeWidth="6"
        pathLength={1}
        className={cn(STROKE, DRAW)}
      />
      <path
        d="M204 46 h18 q4 0 6 4 q3 6 10 6 h4 q7 0 10 -6 q2 -4 6 -4 h18 v136 h-72 z"
        strokeWidth="5"
        pathLength={1}
        className={cn(STROKE, DRAW)}
      />
      <rect x="226" y="198" width="28" height="6" rx="3" className="fill-bvc-ink" />
      {/* Lỗ cắm ở đáy */}
      <rect x="234" y="212" width="12" height="6" rx="2" className="fill-bvc-ink" />

      {/* Màn hình sáng + tai nghe nhỏ trên màn */}
      <g className="opacity-0 animate-hp-screen motion-reduce:animate-none motion-reduce:opacity-100">
        <rect x="207" y="60" width="66" height="118" rx="4" className="fill-bvc-accent-tint" />
        <path d="M222 128 v-10 a18 18 0 0 1 36 0 v10" strokeWidth="5" className={STROKE} />
        <rect x="216" y="122" width="10" height="18" rx="5" className="fill-bvc-ink" />
        <rect x="254" y="122" width="10" height="18" rx="5" className="fill-bvc-ink" />
      </g>

      {/* Tai nghe lớn */}
      <path d="M40 120 v-14 a40 40 0 0 1 80 0 v14" strokeWidth="6" pathLength={1} className={cn(STROKE, DRAW)} />
      <rect x="28" y="112" width="22" height="38" rx="11" strokeWidth="6" pathLength={1} className={cn(STROKE, DRAW)} />
      <rect
        x="110"
        y="112"
        width="22"
        height="38"
        rx="11"
        strokeWidth="6"
        pathLength={1}
        className={cn(STROKE, DRAW)}
      />

      {/* Sóng âm từ chụp tai trái */}
      <path
        d="M14 116 q-8 15 0 30"
        strokeWidth="4"
        className={cn(STROKE, ORIGIN, "stroke-bvc-accent opacity-0 animate-hp-wave motion-reduce:hidden")}
      />
      <path
        d="M4 108 q-12 23 0 46"
        strokeWidth="4"
        className={cn(STROKE, ORIGIN, "stroke-bvc-accent opacity-0 animate-hp-wave-late motion-reduce:hidden")}
      />

      {/* Dây: từ chụp tai phải xuống đáy điện thoại */}
      <path
        d="M121 150 C 126 214, 196 236, 240 234"
        strokeWidth="4"
        pathLength={1}
        className={cn(STROKE, "stroke-bvc-muted [stroke-dasharray:1] animate-hp-cable motion-reduce:animate-none")}
      />
      {/* Đầu cắm: trượt lên vào lỗ */}
      <g className="animate-hp-plug motion-reduce:animate-none">
        <rect x="235" y="218" width="10" height="16" rx="3" className="fill-bvc-ink" />
        <rect x="238" y="212" width="4" height="8" rx="1" className="fill-bvc-accent" />
      </g>

      {/* Dấu tích */}
      <g className={cn(ORIGIN, "scale-0 animate-hp-check motion-reduce:animate-none motion-reduce:scale-100")}>
        <circle cx="286" cy="26" r="16" className="fill-bvc-accent" />
        <path d="M278 26 l6 6 l10 -12" strokeWidth="4" className={cn(STROKE, "stroke-white")} />
      </g>
    </svg>
  );
}
