import { useNavigate } from "react-router-dom";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { ScoreRing } from "@/shared/components/bvc/ScoreRing";
import { ScoreBar } from "@/shared/components/bvc/ScoreBar";

// ── Mock issues ───────────────────────────────────────────────────────────────

const ISSUES = [
  {
    id: "1",
    barLabel: "Bar 18–24",
    description: "Tempo chậm 12% so với bản mẫu, thiếu nốt móc đơn",
  },
  {
    id: "2",
    barLabel: "Bar 9–12",
    description: "Cao độ Rê4 lệch -18¢, nên ở -5¢ trở lên",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function AnalysisPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="back"
          title="Kết quả phân tích"
          subtitle="Lý ngựa ô · Bản thu #3"
        />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Section 1 — Score ring */}
          <div className="flex flex-col items-center py-[24px]">
            <ScoreRing
              score={82}
              size={140}
              label="Tổng thể"
              sublabel="Tốt — tiếp tục giữ!"
            />
          </div>

          {/* Section 2 — Detailed score bars */}
          <div className="mx-[14px] rounded-[20px] border border-bvc-border p-[16px]">
            <p className="mb-[14px] text-[15px] font-bold text-bvc-ink">
              Phân tích chi tiết
            </p>
            <div className="flex flex-col gap-[12px]">
              <ScoreBar label="Cao độ" score={88} />
              <ScoreBar label="Nhịp" score={74} />
              <ScoreBar label="Tempo" score={79} />
              <ScoreBar label="Kỹ thuật" score={85} />
            </div>
          </div>

          {/* Section 3 — Issues */}
          <div className="mx-[14px] mt-[12px] rounded-[20px] border border-bvc-border p-[16px]">
            <p className="mb-[14px] text-[15px] font-bold text-bvc-ink">
              Cần cải thiện
            </p>
            <div className="flex flex-col gap-[12px]">
              {ISSUES.map((issue) => (
                <div key={issue.id} className="flex items-start gap-[10px]">
                  <span className="shrink-0 rounded-[8px] bg-bvc-accent-tint px-[9px] py-[3px] font-bvc-mono text-[11px] font-semibold text-bvc-accent-text">
                    {issue.barLabel}
                  </span>
                  <span className="text-[13px] leading-snug text-bvc-muted">
                    {issue.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 — Next steps */}
          <div className="mx-[14px] mt-[12px] rounded-[20px] border border-bvc-border p-[16px]">
            <p className="mb-[12px] text-[15px] font-bold text-bvc-ink">
              Bài học tiếp theo
            </p>
            <div className="flex flex-col gap-[10px]">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white py-[12px] text-[14px] font-semibold text-bvc-ink"
              >
                Xem chi tiết lỗi
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full cursor-pointer rounded-[14px] border border-bvc-accent bg-bvc-accent-tint py-[12px] text-[14px] font-semibold text-bvc-accent-text"
              >
                Luyện lại đoạn 18–24
              </button>
            </div>
          </div>

          {/* Spacer for bottom CTA */}
          <div className="h-[88px]" />
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 px-[14px] pb-[24px] pt-[10px]">
          <button
            type="button"
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-bvc-ink text-[15px] font-bold text-white"
          >
            Nộp bản thu này
          </button>
        </div>
      </div>
    </div>
  );
}
