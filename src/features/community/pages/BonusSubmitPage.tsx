import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { StatusDot } from "@/shared/components/bvc/StatusDot";

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
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 px-3.5 py-4 sm:px-6 md:gap-5 md:py-8">
        {/* Navigation / Breadcrumb */}
        <Link
          to="/community/bonus"
          className="group inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-bvc-accent transition-colors hover:text-bvc-ink"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Quay lại bài bonus</span>
        </Link>

        <h1 className="font-bvc-display text-[22px] font-black tracking-tight text-bvc-ink sm:text-[24px]">
          Tiến trình nộp bài Bonus
        </h1>

        {/* Stepper Card */}
        <div className="rounded-2xl border border-bvc-border bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-0">
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
                  className={`mt-[5px] text-center text-[10px] sm:text-[11px] ${
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
        </div>

        {/* Recording card */}
        <div className="rounded-2xl border border-bvc-border bg-white p-4 sm:p-5 shadow-2xs">
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
        <div className="rounded-2xl border border-bvc-border bg-white p-4 sm:p-5 shadow-2xs">
          {/* Accuracy row */}
          <div className="flex items-center justify-between py-[4px]">
            <span className="text-[14px] text-bvc-ink">
              Accuracy AI dự đoán
            </span>
            <span className="font-mono text-[14px] font-bold text-bvc-accent">
              87%
            </span>
          </div>

          <div className="my-[8px] h-px bg-bvc-line" />

          {/* Note */}
          <p className="text-[12.5px] leading-relaxed text-bvc-muted">
            Bản thu sẽ được chuyển đến giảng viên bộ môn để lắng nghe và đánh giá.
          </p>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-[8px] rounded-2xl border border-bvc-border bg-white px-[14px] py-[12px] shadow-2xs">
          <StatusDot status="warn" size={7} />
          <span className="text-[13px] text-bvc-ink">
            Đang chờ GV review
          </span>
        </div>
      </div>
    </StudentShell>
  );
}
