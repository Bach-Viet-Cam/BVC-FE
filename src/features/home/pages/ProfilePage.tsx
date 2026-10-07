import { useState } from "react";
import { Pencil } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";

const INSTRUMENTS = ["Đàn tranh", "Đàn bầu", "Tỳ bà", "Sáo trúc"];

const TOGGLE_SETTINGS = [
  { key: "dailyReminder", label: "Nhắc luyện tập hằng ngày", defaultOn: true },
  {
    key: "teacherApproval",
    label: "Thông báo khi giảng viên duyệt bài",
    defaultOn: true,
  },
  { key: "wifiOnly", label: "Chỉ gửi bản thu khi có Wi-Fi", defaultOn: false },
  {
    key: "showOnLeaderboard",
    label: "Hiện tên tôi trên bảng xếp hạng",
    defaultOn: true,
  },
] as const;

export function ProfilePage() {
  const [selectedInstrument, setSelectedInstrument] = useState(
    INSTRUMENTS[0],
  );
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(
      TOGGLE_SETTINGS.map(({ key, defaultOn }) => [key, defaultOn]),
    ),
  );

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Hồ sơ & cài đặt"
          rightSlot={
            <button
              type="button"
              className="flex min-h-[38px] shrink-0 cursor-pointer items-center rounded-[13px] bg-bvc-ink px-[14px] text-[14px] font-bold text-white"
            >
              Lưu
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto px-[16px] pt-[8px]">
          {/* Profile card */}
          <div className="flex items-center gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
            <span className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-bvc-accent-tint text-[20px] font-extrabold text-bvc-accent-text">
              TM
            </span>
            <span className="flex flex-1 flex-col gap-[3px]">
              <span className="text-[18px] font-extrabold tracking-[-0.02em] text-bvc-ink">
                Trần Minh Anh
              </span>
              <span className="text-[12.5px] text-bvc-muted">
                Sinh viên · FPT University
              </span>
            </span>
            <button
              type="button"
              aria-label="Đổi ảnh đại diện"
              className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[13px] border border-bvc-border-strong bg-white text-bvc-muted"
            >
              <Pencil size={18} strokeWidth={1.7} />
            </button>
          </div>

          {/* Instrument card */}
          <div className="mt-[14px] flex flex-col gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
            <div className="flex flex-col gap-[3px]">
              <span className="text-[14px] font-bold text-bvc-ink">
                Nhạc cụ đang học
              </span>
              <span className="text-[12.5px] text-bvc-muted">
                Quyết định preset của Tuner và bản nhạc được gợi ý
              </span>
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {INSTRUMENTS.map((instrument) => {
                const selected = instrument === selectedInstrument;
                return (
                  <button
                    key={instrument}
                    type="button"
                    onClick={() => setSelectedInstrument(instrument)}
                    className={`min-h-[38px] cursor-pointer rounded-[12px] border px-[13px] text-[14px] ${
                      selected
                        ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                        : "border-bvc-border-strong bg-white text-bvc-ink"
                    }`}
                  >
                    {instrument}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-bvc-line pt-[12px]">
              <label htmlFor="tone" className="text-[14px] text-bvc-muted">
                Tone chuẩn khi lên dây
              </label>
              <select
                id="tone"
                className="h-[40px] rounded-[12px] border border-bvc-border-strong bg-white px-[10px] font-bvc-mono text-[14px] text-bvc-ink"
              >
                <option>Đô — A4 440 Hz</option>
                <option>Rê — A4 440 Hz</option>
              </select>
            </div>
          </div>

          {/* Toggle settings card */}
          <div className="mt-[14px] flex flex-col rounded-[20px] border border-bvc-border bg-white px-[16px]">
            {TOGGLE_SETTINGS.map(({ key, label }, index) => (
              <div
                key={key}
                className={`flex min-h-[52px] items-center justify-between gap-3 text-[14px] text-bvc-ink ${
                  index < TOGGLE_SETTINGS.length - 1
                    ? "border-b border-bvc-line"
                    : ""
                }`}
              >
                {label}
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggles[key]}
                  onClick={() => toggle(key)}
                  className={`relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    toggles[key] ? "bg-bvc-accent" : "bg-bvc-bar"
                  }`}
                >
                  <span
                    className={`absolute size-[20px] rounded-full bg-white shadow transition-transform ${
                      toggles[key] ? "translate-x-[22px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Offline storage */}
          <div className="mt-[14px] flex items-center justify-between gap-3 rounded-[20px] border border-bvc-border bg-white p-[14px_16px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[14px] font-bold text-bvc-ink">
                Dung lượng bản thu ngoại tuyến
              </span>
              <span className="text-[12.5px] text-bvc-muted">
                18 bản · 214 MB đang lưu trên máy
              </span>
            </span>
            <button
              type="button"
              className="min-h-[38px] shrink-0 cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13.5px] font-semibold text-bvc-ink"
            >
              Dọn bớt
            </button>
          </div>

          <div className="h-4" />
        </div>

        {/* Sign out */}
        <div className="shrink-0 px-[16px] pb-[26px] pt-[14px]">
          <button
            type="button"
            className="h-[50px] w-full cursor-pointer rounded-[16px] border border-[#E6D29A] bg-bvc-accent-tint text-[15px] font-bold text-bvc-accent-text"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
