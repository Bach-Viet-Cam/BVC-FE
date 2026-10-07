import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { TagBadge, StatusDot } from "@/shared/components/bvc";

const DIFFICULTY_LEVELS = ["Cơ bản", "Trung cấp", "Nâng cao", "Hòa tấu"] as const;
type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

interface InstrumentRow {
  id: number;
  name: string;
  checked: boolean;
  status: "ok" | "warn" | "muted";
  statusLabel: string;
}

const INITIAL_INSTRUMENTS: InstrumentRow[] = [
  { id: 1, name: "Đàn tranh", checked: true, status: "ok", statusLabel: "Verified" },
  { id: 2, name: "Đàn bầu", checked: true, status: "ok", statusLabel: "Verified" },
  { id: 3, name: "Đàn nhị", checked: true, status: "warn", statusLabel: "Chờ duyệt" },
  { id: 4, name: "Đàn tỳ bà", checked: false, status: "muted", statusLabel: "Chưa có" },
];

const STATUS_BADGE_STYLES: Record<string, string> = {
  ok: "bg-[#EBF5EE] text-bvc-ok border border-[#C8E6D3]",
  warn: "bg-[#FEF8EC] text-[#A07010] border border-[#F3D98A]",
  muted: "bg-bvc-surface text-bvc-muted border border-bvc-border",
};

const INITIAL_TAGS = ["dân ca", "nam bộ", "đàn tranh"];

export function SongFormPage() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Trung cấp");
  const [instruments, setInstruments] = useState<InstrumentRow[]>(INITIAL_INSTRUMENTS);
  const [tags, setTags] = useState<string[]>(INITIAL_TAGS);

  const toggleInstrument = (id: number) => {
    setInstruments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, checked: !inst.checked } : inst))
    );
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-32 py-5">
        <button
          type="button"
          onClick={() => navigate("/songs")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            M02 · Thư viện học liệu
          </span>
          <span className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Chỉnh sửa bài nhạc
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
            Xuất bản
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 gap-[20px] overflow-hidden p-[22px_32px]">
        {/* Left section */}
        <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto">
          {/* Thông tin cơ bản */}
          <div className="flex flex-col gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[20px]">
            <span className="text-[15px] font-bold text-bvc-ink">Thông tin cơ bản</span>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Tên bài nhạc</label>
              <input
                type="text"
                defaultValue="Lý ngựa ô"
                className="h-[44px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Thể loại</label>
              <input
                type="text"
                defaultValue="Dân ca Nam Bộ"
                className="h-[44px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Xuất xứ / Ghi chú</label>
              <textarea
                rows={2}
                defaultValue="Dân ca Nam Bộ, phổ biến ở đồng bằng sông Cửu Long."
                className="rounded-[14px] border border-bvc-border-strong bg-white px-[14px] py-[10px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>

            {/* Độ khó */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Độ khó</label>
              <div className="flex gap-[8px]">
                {DIFFICULTY_LEVELS.map((level) => {
                  const isActive = difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`cursor-pointer rounded-[12px] border px-[14px] py-[7px] text-[13.5px] font-semibold transition-colors ${
                        isActive
                          ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                          : "border-bvc-border-strong bg-white text-bvc-muted"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhịp */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">Nhịp</label>
              <div className="flex items-center gap-[8px]">
                <input
                  type="number"
                  defaultValue={2}
                  className="h-[44px] w-[80px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-center text-[14px] text-bvc-ink focus:outline-none"
                />
                <span className="text-[18px] font-semibold text-bvc-muted">/</span>
                <input
                  type="number"
                  defaultValue={4}
                  className="h-[44px] w-[80px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-center text-[14px] text-bvc-ink focus:outline-none"
                />
              </div>
            </div>

            {/* BPM */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted">BPM mặc định</label>
              <input
                type="number"
                defaultValue={84}
                className="h-[44px] w-[140px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Nhạc cụ & bản nhạc */}
          <div className="flex flex-1 flex-col gap-[12px] rounded-[20px] border border-bvc-border bg-white p-[20px]">
            <span className="text-[15px] font-bold text-bvc-ink">Bản nhạc theo nhạc cụ</span>

            <div className="flex flex-col gap-[8px]">
              {instruments.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-[12px] rounded-[14px] bg-bvc-surface p-[11px_14px]"
                >
                  <input
                    type="checkbox"
                    checked={inst.checked}
                    onChange={() => toggleInstrument(inst.id)}
                    className="size-[16px] cursor-pointer accent-bvc-accent"
                  />
                  <span className="flex-1 text-[14px] font-medium text-bvc-ink">{inst.name}</span>
                  <span
                    className={`rounded-[9px] px-[8px] py-[3px] text-[12px] font-semibold ${STATUS_BADGE_STYLES[inst.status]}`}
                  >
                    {inst.statusLabel}
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                  >
                    Xem/Tải lên
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="self-start cursor-pointer rounded-[12px] border border-dashed border-bvc-border-strong bg-white px-[14px] py-[8px] text-[13.5px] text-bvc-muted"
            >
              + Thêm nhạc cụ
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="flex w-[340px] shrink-0 flex-col gap-[16px] overflow-y-auto border-l border-bvc-border-strong bg-bvc-surface p-[22px_20px]">
          {/* Status card */}
          <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-bvc-ink">Trạng thái</span>
              <StatusDot status="ok" label="Verified" />
            </div>
            <span className="text-[12.5px] text-bvc-muted">Xuất bản lần cuối: 12/09/2026</span>
            <button
              type="button"
              className="flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-[13.5px] font-semibold text-bvc-ink"
            >
              Cập nhật nội dung
            </button>
          </div>

          {/* Tags card */}
          <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[14px]">
            <span className="text-[13.5px] font-bold text-bvc-ink">Tags</span>
            <div className="flex flex-wrap gap-[6px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-[4px] rounded-full border border-bvc-border-strong bg-bvc-surface px-[10px] py-[4px] text-[12.5px] text-bvc-muted"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="cursor-pointer"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              className="self-start cursor-pointer rounded-[12px] border border-dashed border-bvc-border-strong bg-white px-[12px] py-[6px] text-[13px] text-bvc-muted"
            >
              + Thêm tag
            </button>
          </div>

          {/* Preview card */}
          <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[14px]">
            <span className="text-[13.5px] font-bold text-bvc-ink">Xem trước trong thư viện</span>
            <div className="flex items-center gap-[10px] rounded-[14px] bg-bvc-surface p-[10px_12px]">
              <div className="flex flex-1 flex-col gap-[3px]">
                <span className="text-[14px] font-bold text-bvc-ink">Lý ngựa ô</span>
                <div className="flex items-center gap-[6px]">
                  <TagBadge label="Verified" variant="verified" />
                  <span className="text-[12px] text-bvc-muted">Dân ca Nam Bộ</span>
                  <span className="text-[12px] text-bvc-faint">·</span>
                  <span className="text-[12px] text-bvc-muted">Trung cấp</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
