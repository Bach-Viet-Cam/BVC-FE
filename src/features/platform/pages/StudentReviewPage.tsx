import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface Student {
  initials: string;
  name: string;
  status: "ok" | "warn" | "error";
}

const STUDENTS: Student[] = [
  { initials: "MA", name: "Minh Anh", status: "ok" },
  { initials: "PL", name: "Phương Linh", status: "ok" },
  { initials: "QB", name: "Quốc Bảo", status: "error" },
  { initials: "GH", name: "Gia Hân", status: "warn" },
  { initials: "HT", name: "Hoàng Tùng", status: "ok" },
];

const STATUS_COLORS: Record<string, string> = {
  ok: "var(--color-bvc-ok)",
  warn: "var(--color-bvc-warn)",
  error: "var(--color-bvc-error)",
};

const PAST_COMMENTS = [
  {
    date: "15/09",
    bar: "Nhịp 4–8",
    comment: "Cao độ nốt La bị thấp hơn chuẩn ~30 cents. Tập chậm hơn.",
  },
  {
    date: "08/09",
    bar: "Tổng thể",
    comment: "Nhịp không đều ở phần B. Dùng metronome 60 BPM.",
  },
  {
    date: "01/09",
    bar: "—",
    comment: "Tiến bộ tốt ở kỹ thuật ngón. Tiếp tục duy trì.",
  },
];

// Bar chart data for last 7 days (relative heights 1–5)
const PRACTICE_BARS = [2, 3, 1, 4, 2, 3, 5];

// Waveform bars (16 bars, heights 1–5, accent at index 4 and 9)
const WAVEFORM_BARS = [2, 4, 3, 5, 3, 2, 4, 3, 1, 4, 3, 5, 2, 3, 4, 2];
const ACCENT_BARS = new Set([4, 9]);

export function StudentReviewPage() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(2);

  const selected = STUDENTS[selectedIdx];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-8 py-5">
        <button
          type="button"
          onClick={() => navigate("/teacher")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            TRD301 · Tuần 3
          </span>
          <span className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Review sinh viên
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Student list */}
        <div className="flex w-[240px] shrink-0 flex-col overflow-hidden border-r border-bvc-border-strong">
          <div className="shrink-0 border-b border-bvc-line px-[16px] py-[13px]">
            <span className="text-[13px] font-bold text-bvc-ink">Sinh viên</span>
          </div>

          {STUDENTS.map((student, idx) => (
            <button
              key={student.initials}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex h-[52px] w-full cursor-pointer items-center gap-3 border-b border-bvc-line px-[16px] text-left last:border-0 ${
                idx === selectedIdx ? "bg-bvc-surface" : "bg-white hover:bg-bvc-surface"
              }`}
            >
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-bvc-surface text-[13px] font-bold text-bvc-ink">
                {student.initials}
              </span>
              <span className="flex-1 text-[13px] text-bvc-ink">{student.name}</span>
              <span
                className="size-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[student.status] }}
              />
            </button>
          ))}
        </div>

        {/* Center panel — Detail */}
        <div className="flex flex-1 flex-col overflow-y-auto p-[24px_28px]">
          <h2 className="text-[20px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Lê {selected.name} — TRD301 · Đàn bầu
          </h2>

          {/* Practice history */}
          <div className="mt-[22px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Lịch sử luyện tập
            </span>
            <div className="mt-[10px] flex items-end gap-[5px]">
              {PRACTICE_BARS.map((h, i) => (
                <div
                  key={i}
                  className={`w-[26px] rounded-[5px] ${i === PRACTICE_BARS.length - 1 ? "bg-bvc-accent" : "bg-bvc-bar"}`}
                  style={{ height: `${h * 8 + 8}px` }}
                />
              ))}
              <span className="ml-[12px] self-center font-mono text-[13px] font-semibold text-bvc-ink">
                9 buổi / 3 tuần
              </span>
            </div>
          </div>

          {/* Latest recording card */}
          <div className="mt-[22px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-bvc-ink">Recording mới nhất</span>
              <span className="font-mono text-[12px] text-bvc-muted">20/09 · 3:14</span>
            </div>

            {/* Waveform */}
            <div className="mt-[12px] flex items-center gap-[3px]">
              {WAVEFORM_BARS.map((h, i) => (
                <div
                  key={i}
                  className={`w-[10px] rounded-[3px] ${ACCENT_BARS.has(i) ? "bg-bvc-accent" : "bg-bvc-bar-strong"}`}
                  style={{ height: `${h * 6 + 4}px` }}
                />
              ))}
            </div>

            {/* Accuracy */}
            <div className="mt-[14px] flex items-baseline gap-[10px]">
              <span className="font-mono text-[27px] font-bold text-bvc-ink">54%</span>
              <span className="text-[13px] text-bvc-accent-text">−8 so với lần trước</span>
            </div>

            {/* Mini score bars */}
            <div className="mt-[12px] flex gap-[12px]">
              {[
                { label: "Cao độ", value: 48 },
                { label: "Nhịp/phách", value: 52 },
                { label: "Kỹ thuật", value: 63 },
              ].map((score) => (
                <div key={score.label} className="flex flex-1 flex-col gap-[4px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-bvc-muted">{score.label}</span>
                    <span className="font-mono text-[12px] font-semibold text-bvc-ink">
                      {score.value}%
                    </span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-full bg-bvc-bar">
                    <div
                      className="h-full rounded-full bg-bvc-ink"
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher comment */}
          <div className="mt-[22px] flex flex-col gap-[10px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Nhận xét giảng viên
            </span>
            <textarea
              rows={3}
              placeholder="Nhận xét cho tuần này..."
              className="min-h-[80px] rounded-[14px] border border-bvc-border-strong bg-white p-3 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
            />
            <div className="flex items-center gap-2 text-[13px] text-bvc-muted">
              <span>Tại ô nhịp:</span>
              <input
                type="number"
                defaultValue={4}
                className="h-[36px] w-[60px] rounded-[10px] border border-bvc-border-strong bg-white text-center font-mono text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center justify-center self-start rounded-[14px] bg-bvc-ink px-[20px] text-[14px] font-bold text-white"
            >
              Gửi nhận xét
            </button>
          </div>
        </div>

        {/* Right panel — Past comments */}
        <div className="flex w-[260px] shrink-0 flex-col border-l border-bvc-border-strong p-[18px]">
          <span className="mb-3 text-[13px] font-bold text-bvc-ink">Nhận xét trước</span>

          {PAST_COMMENTS.map((c) => (
            <div key={c.date} className="border-b border-bvc-line py-[12px] last:border-0">
              <div className="mb-[4px] flex items-center gap-[8px]">
                <span className="font-mono text-[11px] text-bvc-muted">{c.date}</span>
                <span className="rounded-[7px] bg-bvc-surface px-[7px] py-[2px] text-[11px] text-bvc-muted">
                  {c.bar}
                </span>
              </div>
              <p className="text-[13px] leading-[1.5] text-bvc-ink">{c.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
