import { StatusDot } from "@/shared/components/bvc/StatusDot";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type StepState = "done" | "active" | "pending";

interface Step {
  label: string;
  state: StepState;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  { label: "Đã nộp", state: "done" },
  { label: "AI pre-check", state: "active" },
  { label: "GV review", state: "pending" },
  { label: "Verified", state: "pending" },
];

const WAVEFORM_HEIGHTS = [40, 65, 80, 55, 90, 70, 45, 60];

const RECORDING = {
  fileName: "recording_ly_ngua_o_be2_take3.m4a",
  duration: "2:47",
  date: "24/09/2026",
};

// ─────────────────────────────────────────────────────────────────────────────

function StepCircle({ step, index }: { step: Step; index: number }) {
  if (step.state === "done") {
    return (
      <div className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-bvc-ok">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 7L5.5 10L11.5 4"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (step.state === "active") {
    return (
      <div className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-bvc-accent">
        <div
          className="size-[8px] rounded-full bg-white"
          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
        />
      </div>
    );
  }

  return (
    <div className="flex size-[28px] shrink-0 items-center justify-center rounded-full border border-bvc-border-strong bg-white">
      <span className="font-mono text-[11px] font-medium text-bvc-muted">
        {index + 1}
      </span>
    </div>
  );
}

export function BonusSubmitPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader title="Nộp bài Bonus" variant="back" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-[14px] pb-[16px]">

          {/* Stepper */}
          <div className="mb-[16px] flex items-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {/* Left connector */}
                  {i > 0 && (
                    <div
                      className={`h-px flex-1 ${
                        STEPS[i - 1].state === "done"
                          ? "bg-bvc-ok"
                          : "bg-bvc-line"
                      }`}
                    />
                  )}

                  <StepCircle step={step} index={i} />

                  {/* Right connector */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 ${
                        step.state === "done" ? "bg-bvc-ok" : "bg-bvc-line"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-[5px] text-center text-[10px] ${
                    step.state === "done" || step.state === "active"
                      ? "font-bold text-bvc-ink"
                      : "font-medium text-bvc-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Recording card */}
          <div className="rounded-[20px] border border-bvc-border p-[14px]">
            <div className="flex items-start justify-between gap-[8px]">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-bvc-ink">
                  {RECORDING.fileName}
                </p>
                <div className="mt-[2px] flex items-center gap-[10px]">
                  <span className="font-mono text-[13px] text-bvc-muted">
                    {RECORDING.duration}
                  </span>
                  <span className="text-[12px] text-bvc-faint">
                    {RECORDING.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini waveform */}
            <div className="mt-[12px] flex h-[40px] items-end gap-[3px]">
              {WAVEFORM_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[2px] bg-bvc-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Predicted score card */}
          <div className="mt-[12px] rounded-[20px] border border-bvc-border p-[14px]">
            {/* Accuracy row */}
            <div className="flex items-center justify-between py-[4px]">
              <span className="text-[14px] text-bvc-ink">
                Accuracy AI dự đoán
              </span>
              <span className="rounded-[8px] bg-bvc-accent-tint px-[8px] py-[3px] font-mono text-[13px] font-bold text-bvc-accent-text">
                87%
              </span>
            </div>

            {/* Divider */}
            <div className="my-[8px] h-px bg-bvc-line" />

            {/* Points row */}
            <div className="flex items-center justify-between py-[4px]">
              <span className="text-[14px] text-bvc-ink">
                Điểm thưởng dự kiến
              </span>
              <span className="font-mono text-[14px] font-bold text-bvc-accent-text">
                +1 điểm
              </span>
            </div>

            {/* Note */}
            <p className="mt-[8px] text-[12px] leading-relaxed text-bvc-muted">
              Điểm sẽ được cộng sau khi GV xác nhận
            </p>
          </div>

          {/* Status row */}
          <div className="mt-[12px] flex items-center gap-[8px] rounded-[14px] border border-bvc-border px-[14px] py-[12px]">
            <StatusDot status="warn" size={7} />
            <span className="text-[13px] text-bvc-ink">
              Đang chờ GV review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
