import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Activity } from "lucide-react";

const ASSIGNMENT_TYPES = ["Luyện ngón", "Luyện rhythm", "Recording", "Sheet", "Bonus"] as const;
type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

const RUBRIC_ROWS = [
  { id: 1, label: "Cao độ", weight: 30 },
  { id: 2, label: "Nhịp / phách", weight: 35 },
  { id: 3, label: "Đồng bộ với ensemble", weight: 35 },
];

const ASSIGN_TO = ["Cả lớp", "Theo nhóm", "Cá nhân"] as const;

export function AssignmentFormPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<AssignmentType>("Recording");
  const [activeAssignTo, setActiveAssignTo] = useState<string>("Cả lớp");
  const [metronomeOn, setMetronomeOn] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(true);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-32 py-5">
        <button
          type="button"
          onClick={() => navigate("/teacher")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            TRD301 · Tuần 5
          </span>
          <span className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Tạo bài tập
          </span>
        </div>

        <div className="ml-auto flex items-center gap-[10px]">
          <button
            type="button"
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
          >
            Giao bài
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px]">
          {/* Card 1: Nội dung */}
          <div className="flex flex-col gap-[16px] rounded-[20px] border border-bvc-border bg-white p-[20px]">
            <span className="text-[15px] font-bold text-bvc-ink">Nội dung</span>

            {/* Loại bài tập */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Loại bài tập</label>
              <div className="flex flex-wrap gap-[8px]">
                {ASSIGNMENT_TYPES.map((type) => {
                  const isActive = activeType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveType(type)}
                      className={`cursor-pointer rounded-[12px] border px-[14px] py-[7px] text-[13.5px] font-semibold transition-colors ${
                        isActive
                          ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                          : "border-bvc-border-strong bg-white text-bvc-muted"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tiêu đề */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Tiêu đề</label>
              <input
                type="text"
                defaultValue="Recording hòa tấu — Trống cơm, bè của bạn"
                className="h-[46px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">
                Mô tả cho sinh viên
              </label>
              <textarea
                rows={3}
                defaultValue="Thu phần bè của mình trên nền virtual ensemble. Nghe kỹ bộ gõ để vào đúng phách 1."
                className="rounded-[14px] border border-bvc-border-strong bg-white px-[14px] py-[11px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            {/* Song attachment */}
            <div className="flex items-center gap-3 rounded-[14px] bg-bvc-surface p-[12px_14px]">
              <Activity size={20} strokeWidth={1.8} className="shrink-0 text-bvc-muted" />
              <div className="flex flex-1 flex-col gap-[2px]">
                <span className="text-[13.5px] font-bold text-bvc-ink">
                  Trống cơm — 4 bè + bộ gõ
                </span>
                <span className="text-[12.5px] text-bvc-muted">Đã gắn bản nhạc</span>
              </div>
              <button
                type="button"
                className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
              >
                Đổi bài nhạc
              </button>
            </div>
          </div>

          {/* Card 2: Rubric */}
          <div className="flex flex-1 flex-col gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[20px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-bvc-ink">Rubric</span>
              <span className="text-[13px] text-bvc-muted">Tổng trọng số phải bằng 100%</span>
            </div>

            <div className="flex flex-col gap-[10px]">
              {RUBRIC_ROWS.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-[12px] rounded-[14px] bg-bvc-surface p-[11px_14px]"
                >
                  <span className="flex-1 text-[14px] text-bvc-ink">{row.label}</span>
                  <input
                    type="number"
                    defaultValue={row.weight}
                    className="font-bvc-mono h-[38px] w-[72px] rounded-[12px] border border-bvc-border-strong bg-white px-[10px] text-center text-[14px] text-bvc-ink focus:outline-none"
                  />
                  <span className="text-[13.5px] text-bvc-muted">%</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="self-start cursor-pointer rounded-[12px] border border-dashed border-bvc-border-strong bg-white px-[14px] py-[8px] text-[13.5px] text-bvc-muted"
            >
              + Thêm tiêu chí
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="flex w-[372px] shrink-0 flex-col gap-[18px] overflow-y-auto border-l border-bvc-border-strong bg-bvc-surface p-[22px_20px]">
          {/* Giao cho */}
          <div className="flex flex-col gap-[10px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Giao cho
            </span>
            <div className="flex gap-[8px]">
              {ASSIGN_TO.map((option) => {
                const isActive = activeAssignTo === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setActiveAssignTo(option)}
                    className={`cursor-pointer rounded-[12px] border px-[13px] py-[7px] text-[13px] font-semibold transition-colors ${
                      isActive
                        ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                        : "border-bvc-border-strong bg-white text-bvc-muted"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <span className="text-[12.5px] text-bvc-muted">32 sinh viên · 4 nhóm hòa tấu</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-bvc-border-strong" />

          {/* Thời hạn & tiêu chí */}
          <div className="flex flex-col gap-[12px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Thời hạn &amp; tiêu chí
            </span>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Hạn nộp</label>
              <input
                type="date"
                defaultValue="2026-09-26"
                className="h-[44px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Số lần nộp</label>
              <input
                type="number"
                defaultValue={3}
                min={1}
                className="h-[44px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            {/* Metronome toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] text-bvc-ink">Bật metronome chỉ dẫn</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={metronomeOn}
                  onChange={(e) => setMetronomeOn(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="peer h-[24px] w-[44px] rounded-full bg-bvc-bar transition-colors peer-checked:bg-bvc-accent" />
                <span className="absolute left-[2px] h-[20px] w-[20px] rounded-full bg-white transition-transform peer-checked:translate-x-[20px]" />
              </label>
            </div>

            {/* AI analysis toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] text-bvc-ink">Cho phép phân tích AI</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={aiAnalysis}
                  onChange={(e) => setAiAnalysis(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="peer h-[24px] w-[44px] rounded-full bg-bvc-bar transition-colors peer-checked:bg-bvc-accent" />
                <span className="absolute left-[2px] h-[20px] w-[20px] rounded-full bg-white transition-transform peer-checked:translate-x-[20px]" />
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-bvc-border-strong" />

          {/* Preview */}
          <div className="flex flex-col gap-[10px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Xem trước thông báo
            </span>
            <div className="flex flex-col gap-[6px] rounded-[18px] border border-bvc-border bg-white p-[14px]">
              <span className="text-[14px] font-bold text-bvc-ink">
                Giao bài mới: Recording hòa tấu — Trống cơm, bè của bạn
              </span>
              <span className="text-[12.5px] text-bvc-muted">
                Hạn: Thứ 6, 26/09/2026 · 23:59
              </span>
              <span className="text-[12.5px] text-bvc-muted">
                3 lần nộp · AI phân tích bật
              </span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
