import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Music2,
  Home,
  BookOpen,
  ClipboardList,
  Users,
} from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");

  const tabs = [
    { value: "today", label: "Hôm nay", icon: Home },
    { value: "practice", label: "Luyện tập", icon: Music2 },
    { value: "library", label: "Thư viện", icon: BookOpen },
    { value: "assignment", label: "Bài tập", icon: ClipboardList },
    { value: "ensemble", label: "Hòa tấu", icon: Users },
  ];

  const streakDays = Array.from({ length: 28 }, (_, i) => {
    if (i < 21) return "past";
    if (i === 21) return "today";
    return "future";
  });

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between px-[14px] pb-[14px] pt-[26px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-bvc-accent">
              <Music2 size={20} color="white" strokeWidth={2} />
            </div>
            <span className="text-[17px] font-bold text-bvc-ink">
              Bách Việt Cầm
            </span>
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              aria-label="Thông báo"
              className="flex size-[44px] cursor-pointer items-center justify-center rounded-[14px] text-bvc-ink"
            >
              <Bell size={20} strokeWidth={1.8} />
            </button>
            <div className="flex size-[34px] items-center justify-center rounded-full bg-bvc-surface">
              <span className="text-[13px] font-bold text-bvc-ink">TM</span>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Date */}
          <p className="px-[14px] text-[12px] font-semibold uppercase tracking-[0.12em] text-bvc-muted">
            Hôm nay · Thứ 5
          </p>

          {/* Greeting */}
          <h1 className="mt-[3px] px-[14px] text-[26px] font-extrabold text-bvc-ink">
            Xin chào, Minh Anh
          </h1>

          {/* Continue card */}
          <div className="mx-[14px] mt-4 rounded-[20px] border border-bvc-border p-[16px]">
            <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-bvc-muted">
              Tiếp tục luyện
            </p>
            <h2 className="mt-1 text-[20px] font-extrabold text-bvc-ink">
              Lý ngựa ô
            </h2>
            <p className="text-[13px] text-bvc-muted">
              Đàn tranh · Trung cấp · trang 2/3
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[12px] text-bvc-muted">74% hoàn thành</span>
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-bvc-border">
                <div
                  className="h-full rounded-full bg-bvc-ok"
                  style={{ width: "74%" }}
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/practice/ly-ngua-o")}
                className="flex h-[40px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[16px] text-[14px] font-bold text-white"
              >
                Luyện tiếp
              </button>
            </div>
          </div>

          {/* Streak section */}
          <div className="px-[14px] mt-4">
            <p className="text-[12px] font-bold uppercase text-bvc-muted">
              Chuỗi luyện tập
            </p>
            <p className="mt-[4px] text-[15px] font-bold text-bvc-ink">
              7 ngày liên tục 🔥
            </p>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {streakDays.map((type, i) => (
                <div
                  key={i}
                  className={`h-[14px] w-[14px] rounded-[3px] ${
                    type === "past"
                      ? "bg-bvc-ok"
                      : type === "today"
                        ? "bg-bvc-accent"
                        : "bg-bvc-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Assignment card */}
          <div className="mx-[14px] mt-4 rounded-[20px] border border-bvc-border p-[16px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-bvc-ink">
                Bài tập tuần 4
              </span>
              <span className="text-[12px] font-semibold text-bvc-warn">
                Hạn: Thứ 6, 26/09
              </span>
            </div>
            <p className="mt-1 text-[13px] text-bvc-muted">
              Recording hòa tấu — Trống cơm
            </p>
            <button
              type="button"
              onClick={() => navigate("/assignment/week4")}
              className="mt-3 flex h-[38px] cursor-pointer items-center rounded-[14px] bg-bvc-accent px-[14px] text-[13px] font-bold text-white"
            >
              Nộp bài
            </button>
          </div>

          <div className="h-4" />
        </div>

        {/* Bottom tab bar */}
        <div className="shrink-0 border-t border-bvc-border bg-white px-[6px] pb-[20px] pt-[10px]">
          <div className="flex">
            {tabs.map(({ value, label, icon: Icon }) => {
              const isActive = activeTab === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-[3px]"
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    className={
                      isActive ? "text-bvc-accent-text" : "text-bvc-faint"
                    }
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      isActive ? "text-bvc-accent-text" : "text-bvc-faint"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
