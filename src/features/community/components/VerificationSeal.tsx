interface VerificationSealProps {
  status: "ready" | "approved" | "rejected";
  animate?: boolean;
}

// Same finite stroke-drawing language as the ensemble headphone prompt.
// A decision mark is rendered only after the server has returned that decision.
export function VerificationSeal({ status, animate = true }: VerificationSealProps) {
  const draw = animate ? "animate-hp-draw [animation-duration:520ms] motion-reduce:animate-none" : "";
  return (
    <svg viewBox="0 0 184 120" aria-hidden="true" className="h-20 w-28 shrink-0 overflow-visible">
      <rect
        x="15"
        y="17"
        width="136"
        height="78"
        rx="16"
        pathLength={1}
        className={`fill-none stroke-bvc-border-strong [stroke-dasharray:1] ${draw}`}
        strokeWidth="2"
      />
      <g fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-bvc-ink">
        {[40, 52, 64, 76, 88, 100, 112, 124].map((x, index) => {
          const height = [10, 22, 36, 17, 30, 42, 24, 12][index];
          return (
            <path
              key={x}
              d={`M${x} ${56 - height / 2}v${height}`}
              pathLength={1}
              className={`[stroke-dasharray:1] ${draw}`}
            />
          );
        })}
      </g>
      <circle
        cx="146"
        cy="86"
        r="24"
        className={status === "approved" ? "fill-bvc-ink" : "fill-bvc-surface stroke-bvc-border-strong"}
        strokeWidth="2"
      />
      {status === "approved" ? (
        <path
          d="m135 86 8 8 15-17"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className={`stroke-white [stroke-dasharray:1] ${draw}`}
        />
      ) : status === "rejected" ? (
        <path
          d="m138 78 16 16m0-16-16 16"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          className={`stroke-bvc-ink [stroke-dasharray:1] ${draw}`}
        />
      ) : (
        <path
          d="M143 93V76l11-3v17m-11-8 11-3M143 93c0 5-10 6-10 1s10-6 10-1m11-3c0 5-10 6-10 1s10-6 10-1"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className={`stroke-bvc-ink [stroke-dasharray:1] ${draw}`}
        />
      )}
    </svg>
  );
}
