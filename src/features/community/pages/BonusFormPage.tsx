import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type BonusType = "Recording" | "Sheet tự soạn" | "Arrangement";
type TargetGroup = "Cả trường" | "TRD301" | "Theo lớp";

const BONUS_TYPES: BonusType[] = ["Recording", "Sheet tự soạn", "Arrangement"];
const TARGET_GROUPS: TargetGroup[] = ["Cả trường", "TRD301", "Theo lớp"];

const THRESHOLD_ROWS = [
  { id: 1, label: "≥90%", defaultPoints: "+2" },
  { id: 2, label: "80–89%", defaultPoints: "+1" },
  { id: 3, label: "<80%", defaultPoints: "Nộp lại" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export function BonusFormPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<BonusType>("Recording");
  const [activeTarget, setActiveTarget] = useState<TargetGroup>("Cả trường");
  const [allowOutside, setAllowOutside] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header bar */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-32 py-5">
        <button
          type="button"
          onClick={() => navigate("/community/bonus")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            M04 · Bonus &amp; Community
          </span>
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Tạo Bonus Assignment
          </h1>
        </div>

        <div className="ml-auto flex gap-[10px]">
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
            Đăng bài
          </button>
        </div>
      </header>

      {/* Two-column scrollable body */}
      <div className="flex flex-1 gap-[28px] overflow-hidden px-32 py-[28px]">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto">
          {/* Tiêu đề bài bonus */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">
              Tiêu đề bài bonus
            </label>
            <input
              type="text"
              className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
              placeholder="Nhập tiêu đề..."
            />
          </div>

          {/* Bài nhạc */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">
              Bài nhạc
            </label>
            <select className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none">
              <option>Lý ngựa ô</option>
              <option>Trống cơm</option>
              <option>Bèo dạt mây trôi</option>
            </select>
          </div>

          {/* Loại bonus — chip group */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-semibold text-bvc-muted">
              Loại bonus
            </label>
            <div className="flex flex-wrap gap-[8px]">
              {BONUS_TYPES.map((type) => {
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

          {/* Mô tả */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">
              Mô tả
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 py-3 text-[14px] text-bvc-ink focus:outline-none"
              placeholder="Mô tả yêu cầu cho sinh viên..."
            />
          </div>

          {/* Two-col grid: Hạn nộp + Số lượt tối đa */}
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">
                Hạn nộp
              </label>
              <input
                type="date"
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">
                Số lượt tối đa
              </label>
              <input
                type="number"
                defaultValue={20}
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Đối tượng — chip group */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-semibold text-bvc-muted">
              Đối tượng
            </label>
            <div className="flex flex-wrap gap-[8px]">
              {TARGET_GROUPS.map((group) => {
                const isActive = activeTarget === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setActiveTarget(group)}
                    className={`cursor-pointer rounded-[12px] border px-[14px] py-[7px] text-[13.5px] font-semibold transition-colors ${
                      isActive
                        ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                        : "border-bvc-border-strong bg-white text-bvc-muted"
                    }`}
                  >
                    {group}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle: Cho phép bài ngoài syllabus */}
          <div className="flex items-center justify-between border-t border-bvc-line py-[14px]">
            <span className="text-[14px] text-bvc-ink">
              Cho phép bài ngoài syllabus
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={allowOutside}
              onClick={() => setAllowOutside((v) => !v)}
              className={`relative flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                allowOutside ? "bg-bvc-ink" : "bg-bvc-bar"
              }`}
            >
              <span
                className={`absolute h-[20px] w-[20px] rounded-full bg-white transition-transform ${
                  allowOutside ? "translate-x-[20px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[360px] shrink-0 flex-col gap-[20px] overflow-y-auto">
          {/* Ngưỡng điểm thưởng */}
          <div className="rounded-[20px] border border-bvc-border p-[18px]">
            <p className="mb-3 text-[14px] font-bold text-bvc-ink">
              Ngưỡng điểm thưởng
            </p>
            <div className="flex flex-col">
              {THRESHOLD_ROWS.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 border-b border-bvc-line py-[10px] last:border-0"
                >
                  <span className="w-[80px] font-mono text-[13px] text-bvc-muted">
                    {row.label}
                  </span>
                  <input
                    type="text"
                    defaultValue={row.defaultPoints}
                    className="h-[36px] w-[80px] rounded-[10px] border border-bvc-border-strong bg-white text-center font-mono text-[14px] text-bvc-ink focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Lưu ý */}
          <div className="rounded-[20px] border border-bvc-border p-[18px]">
            <p className="mb-3 text-[14px] font-bold text-bvc-ink">Lưu ý</p>
            <ul className="flex flex-col gap-[6px] text-[13px] leading-[1.6] text-bvc-muted">
              <li className="flex gap-[8px]">
                <span className="mt-[5px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Điểm bonus được cộng sau khi GV xác nhận
              </li>
              <li className="flex gap-[8px]">
                <span className="mt-[5px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Mỗi sinh viên chỉ được nộp 1 lần cho mỗi bonus
              </li>
              <li className="flex gap-[8px]">
                <span className="mt-[5px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Bài ngoài syllabus chỉ áp dụng nếu bật toggle
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
