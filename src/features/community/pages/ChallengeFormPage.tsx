import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type TargetGroup = "Cả trường" | "TRD301" | "TRD302";
type RankCriteria = "Accuracy cao nhất" | "Cải thiện nhiều nhất" | "Streak dài nhất";

const TARGET_GROUPS: TargetGroup[] = ["Cả trường", "TRD301", "TRD302"];
const RANK_CRITERIA: RankCriteria[] = ["Accuracy cao nhất", "Cải thiện nhiều nhất", "Streak dài nhất"];

// ─────────────────────────────────────────────────────────────────────────────

export function ChallengeFormPage() {
  const navigate = useNavigate();
  const [activeTarget, setActiveTarget] = useState<TargetGroup>("Cả trường");
  const [activeRank, setActiveRank] = useState<RankCriteria>("Accuracy cao nhất");

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header bar */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-32 py-5">
        <button
          type="button"
          onClick={() => navigate("/community/challenges")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            M04 · Community
          </span>
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Tạo Community Challenge
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
            Đăng
          </button>
        </div>
      </header>

      {/* Two-column scrollable body */}
      <div className="flex flex-1 gap-[28px] overflow-hidden px-32 py-[28px]">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto">
          {/* Tên challenge */}
          <div className="flex flex-col gap-[6px]">
            <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
              Tên challenge
            </label>
            <input
              type="text"
              className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
              placeholder="Nhập tên challenge..."
            />
          </div>

          {/* Bài nhạc */}
          <div className="flex flex-col gap-[6px]">
            <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
              Bài nhạc
            </label>
            <select className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none">
              <option>Lý ngựa ô</option>
              <option>Trống cơm</option>
              <option>Bèo dạt mây trôi</option>
            </select>
          </div>

          {/* BPM + Dung sai side by side */}
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
                BPM yêu cầu
              </label>
              <input
                type="number"
                defaultValue={120}
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 font-mono text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
                Dung sai ±BPM
              </label>
              <input
                type="number"
                defaultValue={5}
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 font-mono text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Thời gian mở + Thời gian đóng side by side */}
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
                Thời gian mở
              </label>
              <input
                type="datetime-local"
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
                Thời gian đóng
              </label>
              <input
                type="datetime-local"
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

          {/* Tiêu chí xếp hạng — chip group */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-semibold text-bvc-muted">
              Tiêu chí xếp hạng
            </label>
            <div className="flex flex-wrap gap-[8px]">
              {RANK_CRITERIA.map((criteria) => {
                const isActive = activeRank === criteria;
                return (
                  <button
                    key={criteria}
                    type="button"
                    onClick={() => setActiveRank(criteria)}
                    className={`cursor-pointer rounded-[12px] border px-[14px] py-[7px] text-[13.5px] font-semibold transition-colors ${
                      isActive
                        ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                        : "border-bvc-border-strong bg-white text-bvc-muted"
                    }`}
                  >
                    {criteria}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phần thưởng */}
          <div className="flex flex-col gap-[6px]">
            <label className="mb-1.5 text-[13px] font-semibold text-bvc-muted">
              Phần thưởng
            </label>
            <input
              type="text"
              className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
              placeholder="VD: +3 điểm participation, danh hiệu Top Performer"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[360px] shrink-0 flex-col gap-[20px] overflow-y-auto">
          {/* Xem trước thông báo */}
          <div className="rounded-[20px] border border-bvc-border p-[18px]">
            <p className="mb-3 text-[14px] font-bold text-bvc-ink">
              Xem trước thông báo
            </p>

            {/* Mini challenge card preview */}
            <div className="rounded-[14px] border-2 border-bvc-border-strong bg-bvc-surface p-[14px]">
              <span className="inline-block rounded-[9px] bg-bvc-accent-tint px-2 py-0.5 text-[12px] font-semibold text-bvc-accent-text">
                Đang diễn ra
              </span>
              <p className="mt-[8px] text-[14px] font-bold text-bvc-ink">
                Tên challenge...
              </p>
              <div className="mt-[8px] flex items-center gap-[10px] text-[12px] text-bvc-muted">
                <span className="font-mono">120 BPM</span>
                <span>·</span>
                <span>Hạn: —</span>
                <span>·</span>
                <span>0 người</span>
              </div>
            </div>

            <p className="mt-[10px] text-[12px] text-bvc-muted">
              Sinh viên sẽ thấy thẻ này trên màn Challenges
            </p>
          </div>

          {/* Lưu ý */}
          <div className="rounded-[20px] border border-bvc-border p-[18px]">
            <p className="mb-3 text-[14px] font-bold text-bvc-ink">Lưu ý</p>
            <ul className="flex flex-col gap-[6px] text-[13px] leading-[1.6] text-bvc-muted">
              <li className="flex gap-[8px]">
                <span className="mt-[5px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Challenge tự kết thúc vào thời gian đóng đã chọn
              </li>
              <li className="flex gap-[8px]">
                <span className="mt-[5px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Xếp hạng được cập nhật sau mỗi lần nộp bài
              </li>
              <li className="flex gap-[8px]">
                <span className="mt-[5px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Không thể chỉnh sửa BPM sau khi challenge đã mở
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
