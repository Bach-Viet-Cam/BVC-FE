import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

// ── Mock data ─────────────────────────────────────────────────────────────────

const BONUS = {
  title: "Recording Lý ngựa ô — bè thứ 2",
  description:
    "Hãy thu âm lại bản bè thứ 2 của bài Lý ngựa ô theo đúng tốc độ quy định. GV sẽ xem xét và chấm điểm trong vòng 48 giờ.",
  sheet: "Lý ngựa ô — Bè 2.pdf",
  thresholds: [
    { range: "≥90%", reward: "+2 điểm" },
    { range: "80–89%", reward: "+1 điểm" },
    { range: "<80%", reward: "Nộp lại" },
  ],
  stats: {
    joined: 14,
    remaining: "6/20",
    deadline: "30/09",
  },
};

// ─────────────────────────────────────────────────────────────────────────────

export function BonusDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader title="Chi tiết Bonus" variant="back" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-[14px] pb-[88px]">

          {/* Top card */}
          <div className="rounded-[20px] border border-bvc-border p-[16px]">
            <p className="text-[17px] font-extrabold leading-tight tracking-[-0.025em] text-bvc-ink">
              {BONUS.title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-bvc-muted">
              {BONUS.description}
            </p>

            {/* Attached sheet pill */}
            <div className="mt-[14px] inline-flex items-center gap-2 rounded-[11px] border border-bvc-border px-3 py-2">
              <Music size={14} className="shrink-0 text-bvc-muted" />
              <span className="text-[13px] font-medium text-bvc-ink">
                {BONUS.sheet}
              </span>
            </div>
          </div>

          {/* Threshold table */}
          <div className="mt-[12px] rounded-[20px] border border-bvc-border p-[14px]">
            <p className="mb-[4px] text-[15px] font-bold text-bvc-ink">
              Điểm thưởng
            </p>
            {BONUS.thresholds.map((row) => (
              <div
                key={row.range}
                className="flex h-[44px] items-center justify-between border-b border-bvc-line last:border-0"
              >
                <span className="text-[14px] text-bvc-ink">{row.range}</span>
                <span className="font-mono text-[14px] font-semibold text-bvc-ink">
                  {row.reward}
                </span>
              </div>
            ))}
          </div>

          {/* Stats row — 3 mini cards */}
          <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
            <div className="rounded-[14px] bg-bvc-surface p-[12px] text-center">
              <p className="font-mono text-[16px] font-bold text-bvc-ink">
                {BONUS.stats.joined}
              </p>
              <p className="mt-[2px] text-[11px] text-bvc-muted">
                Đã tham gia
              </p>
            </div>
            <div className="rounded-[14px] bg-bvc-surface p-[12px] text-center">
              <p className="font-mono text-[16px] font-bold text-bvc-ink">
                {BONUS.stats.remaining}
              </p>
              <p className="mt-[2px] text-[11px] text-bvc-muted">Còn lại</p>
            </div>
            <div className="rounded-[14px] bg-bvc-surface p-[12px] text-center">
              <p className="font-mono text-[16px] font-bold text-bvc-ink">
                {BONUS.stats.deadline}
              </p>
              <p className="mt-[2px] text-[11px] text-bvc-muted">Hạn</p>
            </div>
          </div>
        </div>

        {/* Bottom sticky CTA */}
        <div className="shrink-0 px-[14px] pb-5 pt-3">
          <button
            type="button"
            onClick={() => navigate("submit")}
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white"
          >
            Bắt đầu luyện
          </button>
        </div>
      </div>
    </div>
  );
}
