import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Waveform } from "@/shared/components/bvc";

const QUEUE = [
  { name: "Trần Minh Anh", score: "88%", scoreColor: "var(--color-bvc-ok)", subtitle: "Bài tập tuần 4 · 2 giờ trước", active: false },
  { name: "Đỗ Khánh Linh", score: "93%", scoreColor: "var(--color-bvc-ok)", subtitle: "Bonus · 4 giờ trước", active: false },
  { name: "Lê Quốc Bảo", score: "54%", scoreColor: "var(--color-bvc-error)", subtitle: "Bài tập tuần 4 · nộp lần 2", active: true },
  { name: "Vũ Nhật Nam", score: "81%", scoreColor: "var(--color-bvc-ok)", subtitle: "Bài tập tuần 4 · hôm qua", active: false },
  { name: "Phạm Gia Hân", score: "72%", scoreColor: "var(--color-bvc-muted)", subtitle: "Community challenge · hôm qua", active: false },
];

const TEACHER_BARS = [25,32,41,64,61,74,54,66,69,61,84,88,71,54,74,47,36,45,45,39,47,39,42,46,72,44,48,51,58,61,73,62,60,69,40,57,53,43,36,42,45,41,44,46,59,88,74,62,76,82,60,59,46,46,61,40,39,33,30,30,33,64,67,85,74,91,83,67,58,64,59,65,72,49,59,42,37,39,43,40,50,47,51,80,64,70,75,66,94,91,68,49,48,37,38,29];
const STUDENT_BARS = [24,30,43,58,50,54,59,74,49,68,74,61,77,71,63,71,38,31,47,31,32,42,49,70,49,47,60,69,92,93,73,63,77,70,37,55,56,45,30,43,49,40,51,45,48,65,71,75,83,83,76,67,73,68,51,43,46,36,38,31,37,63,65,76,59,71,85,68,71,54,67,79,63,67,51,34,28,42,33,41,52,70,78,65,61,65,59,68,81,80,54,50,43,49,45,46];

const AI_SCORES = [
  { label: "Tổng thể", score: "54%", color: "var(--color-bvc-accent-text)", bg: "var(--color-bvc-accent-tint)" },
  { label: "Cao độ", score: "78%", color: "var(--color-bvc-ink)", bg: "var(--color-bvc-surface)" },
  { label: "Nhịp", score: "41%", color: "var(--color-bvc-accent-text)", bg: "var(--color-bvc-surface)" },
  { label: "Tempo", score: "62%", color: "var(--color-bvc-muted)", bg: "var(--color-bvc-surface)" },
];

const AI_ISSUES = [
  { bar: "9–14", text: "Sai trường độ liên tục, bỏ 4 nốt móc đơn", error: true },
  { bar: "5–8", text: "Nhanh hơn bản mẫu 8%, không giữ được tempo sau đoạn luyến", error: false },
  { bar: "Mic", text: "Tiếng ồn nền cao ở 30 giây đầu, vẫn đủ điều kiện phân tích", error: false },
];

const RUBRIC = [
  { label: "Cao độ · 30%", id: "r1", value: 7 },
  { label: "Nhịp · 30%", id: "r2", value: 4 },
  { label: "Tempo · 20%", id: "r3", value: 6 },
  { label: "Kỹ thuật · 20%", id: "r4", value: 6 },
];

export function ReviewPage() {
  const navigate = useNavigate();
  const [rubric, setRubric] = useState<Record<string, number>>(
    Object.fromEntries(RUBRIC.map((r) => [r.id, r.value]))
  );
  const [comment, setComment] = useState("");

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Top header */}
      <header className="flex shrink-0 items-center gap-[16px] border-b border-bvc-border-strong px-[32px] py-[22px] pb-[18px]">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => navigate("/teacher")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-bvc-ink"
        >
          <ChevronLeft size={20} strokeWidth={1.8} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            Hàng đợi duyệt · 3 / 18
          </div>
          <div className="text-[24px] font-extrabold tracking-[-0.025em]">
            Lê Quốc Bảo — Recording "Lý ngựa ô"
          </div>
        </div>
        <div className="flex gap-[9px]">
          <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[15px] text-[14px]">Bài trước</button>
          <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[15px] text-[14px]">Bài sau</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — queue */}
        <aside className="flex w-[262px] shrink-0 flex-col gap-[10px] overflow-hidden border-r border-bvc-border-strong bg-bvc-surface p-[16px_12px]">
          <div className="px-[6px] text-[12px] font-bold uppercase tracking-[0.1em] text-bvc-muted">Chờ duyệt</div>
          <div className="flex flex-col gap-[4px]">
            {QUEUE.map((q) => (
              <button
                key={q.name}
                type="button"
                className="flex flex-col gap-[3px] rounded-[14px] p-[11px_12px] text-left"
                style={{
                  background: q.active ? "#FFFFFF" : "transparent",
                  border: q.active ? "1px solid #F9D2C2" : "none",
                }}
              >
                <span className="flex items-center justify-between">
                  <span
                    className="text-[14px]"
                    style={{ fontWeight: q.active ? 700 : undefined, color: q.active ? "var(--color-bvc-accent-text)" : undefined }}
                  >
                    {q.name}
                  </span>
                  <span className="font-bvc-mono text-[12.5px]" style={{ color: q.scoreColor }}>
                    {q.score}
                  </span>
                </span>
                <span className="text-[12px] text-bvc-muted">{q.subtitle}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center — audio comparison */}
        <main className="flex min-w-0 flex-1 flex-col gap-[16px] overflow-hidden p-[20px_24px]">
          <div className="flex flex-col gap-[16px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
            {/* Teacher waveform */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-bvc-muted">Bản mẫu của giảng viên</span>
                <span className="font-bvc-mono text-[12.5px] text-bvc-muted">84 BPM · 2:54</span>
              </div>
              <Waveform bars={TEACHER_BARS.map((h) => ({ h }))} height={46} defaultColor="var(--color-bvc-bar)" />
            </div>

            {/* Student waveform */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-bvc-accent-text">Bản thu của sinh viên</span>
                <span className="font-bvc-mono text-[12.5px] text-bvc-muted">91 BPM trung bình · 2:41</span>
              </div>
              <Waveform
                bars={STUDENT_BARS.slice(0, 52).map((h) => ({ h, color: "var(--color-bvc-bar-strong)" })).concat(
                  STUDENT_BARS.slice(52, 68).map((h) => ({ h, color: "var(--color-bvc-warn)" })),
                  STUDENT_BARS.slice(68).map((h) => ({ h, color: "var(--color-bvc-bar-strong)" }))
                )}
                height={46}
              />
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-[14px]">
              <button type="button" className="flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-[16px] bg-bvc-accent text-white">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12z" /></svg>
              </button>
              <div className="relative h-[5px] flex-1 rounded-[3px] bg-bvc-border">
                <span className="absolute inset-y-0 left-0 w-[38%] rounded-[3px] bg-bvc-bar-strong" />
              </div>
              <span className="font-bvc-mono shrink-0 text-[13.5px] text-bvc-muted">1:02 / 2:41</span>
              <button type="button" className="min-h-[38px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-[13px] text-[13.5px]">Chỉ nghe Bar 18–24</button>
              <button type="button" className="min-h-[38px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-[13px] text-[13.5px]">Tốc độ 0.75×</button>
            </div>
          </div>

          {/* AI pre-check */}
          <div className="flex flex-1 flex-col gap-[13px] overflow-hidden rounded-[20px] border border-bvc-border bg-white p-[18px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-bold">AI pre-check</span>
              <span className="text-[13px] text-bvc-muted">Không thay thế đánh giá của giảng viên</span>
            </div>
            <div className="grid grid-cols-4 gap-[12px]">
              {AI_SCORES.map((s) => (
                <div key={s.label} className="flex flex-col gap-[4px] rounded-[16px] p-[13px_14px]" style={{ background: s.bg }}>
                  <span className="text-[12.5px] text-bvc-muted">{s.label}</span>
                  <span className="font-bvc-mono text-[26px] font-semibold leading-none" style={{ color: s.color }}>{s.score}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[7px]">
              {AI_ISSUES.map((issue) => (
                <div key={issue.bar} className="flex items-center gap-[11px] rounded-[14px] bg-bvc-surface p-[10px_12px]">
                  <span
                    className="font-bvc-mono rounded-[8px] px-[8px] py-[4px] text-[12.5px] font-semibold"
                    style={{
                      color: issue.error ? "var(--color-bvc-accent-text)" : "var(--color-bvc-muted)",
                      backgroundColor: issue.error ? "var(--color-bvc-accent-tint)" : "var(--color-bvc-surface)",
                    }}
                  >
                    {issue.bar}
                  </span>
                  <span className="text-[14px]">{issue.text}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right sidebar — rubric + comment */}
        <aside className="flex w-[348px] shrink-0 flex-col gap-[16px] overflow-hidden border-l border-bvc-border-strong bg-bvc-surface p-[20px]">
          <div className="flex flex-col gap-[11px]">
            <span className="text-[14px] font-bold">Chấm theo rubric</span>
            <div className="flex flex-col gap-[9px]">
              {RUBRIC.map((r) => (
                <div key={r.id} className="flex items-center gap-[10px]">
                  <label htmlFor={r.id} className="flex-1 text-[13.5px] text-bvc-muted">{r.label}</label>
                  <input
                    id={r.id}
                    type="number"
                    min={0}
                    max={10}
                    value={rubric[r.id]}
                    onChange={(e) => setRubric((prev) => ({ ...prev, [r.id]: +e.target.value }))}
                    className="font-bvc-mono h-[36px] w-[62px] rounded-[11px] border border-bvc-border-strong bg-white px-[10px] text-[14px] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-bold">Nhận xét của giảng viên</span>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhận xét chi tiết..."
              className="resize-none rounded-[14px] border border-bvc-border-strong bg-white p-[12px] text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
            />
          </div>

          <div className="mt-auto flex flex-col gap-[9px]">
            <button type="button" className="min-h-[44px] cursor-pointer rounded-[14px] border-none bg-bvc-ink text-[14px] font-bold text-white">
              Duyệt — Đạt
            </button>
            <button type="button" className="min-h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white text-[14px] font-semibold text-bvc-ink">
              Trả lại — Chưa đạt
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
