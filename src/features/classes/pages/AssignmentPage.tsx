import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";

const ASSIGNMENT = {
  title: "Recording hòa tấu — Trống cơm, bè của bạn",
  description:
    "Thu phần bè của mình trên nền virtual ensemble. Nghe kỹ bộ gõ để vào đúng phách 1.",
  rubric: [
    { label: "Cao độ", weight: 30 },
    { label: "Nhịp / phách", weight: 35 },
    { label: "Đồng bộ ensemble", weight: 35 },
  ],
  previousSubmissions: [
    { attempt: 1, date: "20/09", score: "71%" },
  ],
  attemptsRemaining: 2,
};

export function AssignmentPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Bài tập tuần 4"
          subtitle="TRD301 · Học kỳ Fall 2026"
        />

        <div className="flex-1 overflow-y-auto">
          {/* Due date banner */}
          <div className="mx-[14px] mt-3 flex items-center gap-3 rounded-[18px] border border-[#F3D98A] bg-[#FEF8EC] p-[12px]">
            <Clock
              size={20}
              className="shrink-0 text-bvc-warn"
              strokeWidth={1.8}
            />
            <span className="flex-1 text-[13px] font-bold text-[#A07010]">
              Hạn nộp: Thứ 6, 26/09/2026 · 23:59
            </span>
            <span className="shrink-0 text-[12px] text-bvc-muted">
              còn 2 ngày
            </span>
          </div>

          {/* Assignment details card */}
          <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[16px]">
            <h2 className="text-[17px] font-extrabold leading-snug text-bvc-ink">
              {ASSIGNMENT.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-bvc-muted">
              {ASSIGNMENT.description}
            </p>

            {/* Rubric */}
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                Tiêu chí chấm điểm
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {ASSIGNMENT.rubric.map(({ label, weight }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="flex-1 text-[13px] text-bvc-ink">
                      {label} · {weight}%
                    </span>
                    <div className="h-[4px] w-[80px] overflow-hidden rounded-full bg-bvc-border">
                      <div
                        className="h-full rounded-full bg-bvc-bar-strong"
                        style={{ width: `${weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submission history */}
          <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[14px]">
            <p className="text-[13px] font-bold text-bvc-ink">
              Lần nộp trước
            </p>

            <div className="mt-2">
              {ASSIGNMENT.previousSubmissions.map((sub) => (
                <div
                  key={sub.attempt}
                  className="flex h-[44px] items-center justify-between"
                >
                  <span className="text-[13px] text-bvc-ink">
                    Lần {sub.attempt} · {sub.date} · {sub.score}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/analysis/week4-attempt${sub.attempt}`)}
                    className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                  >
                    Xem phân tích
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-1 text-[12px] text-bvc-muted">
              Còn {ASSIGNMENT.attemptsRemaining} lần nộp
            </p>
          </div>

          <div className="h-4" />
        </div>

        {/* Bottom submit button */}
        <div className="shrink-0 px-[14px] pb-5 pt-3">
          <button
            type="button"
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-bvc-accent text-[16px] font-bold text-white"
          >
            Nộp bài mới
          </button>
        </div>
      </div>
    </div>
  );
}
