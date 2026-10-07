import { useState } from "react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeaderboardRow {
  rank: number;
  initials: string;
  name: string;
  course?: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
}

interface MyRow {
  rank: string;
  initials: string;
  name: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
}

type TabId = "accuracy" | "progress" | "streak" | "active";

// ── Mock data ─────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "accuracy", label: "Accuracy" },
  { id: "progress", label: "Tiến bộ" },
  { id: "streak", label: "Streak" },
  { id: "active", label: "Tích cực" },
];

const TAB_DATA: Record<TabId, { rows: LeaderboardRow[]; my: MyRow }> = {
  accuracy: {
    rows: [
      { rank: 1, initials: "PL", name: "Phương Linh", course: "Đàn tranh", value: "94%", delta: "+3%", deltaPositive: true },
      { rank: 2, initials: "MA", name: "Minh Anh", course: "Đàn bầu", value: "92%", delta: "+6%", deltaPositive: true },
      { rank: 3, initials: "HT", name: "Hoàng Tùng", course: "Đàn tranh", value: "89%", delta: "-1%", deltaPositive: false },
      { rank: 4, initials: "GH", name: "Gia Hân", course: "Đàn bầu", value: "84%", delta: "+4%", deltaPositive: true },
      { rank: 5, initials: "QB", name: "Quốc Bảo", course: "Đàn tranh", value: "71%", delta: "+12%", deltaPositive: true },
    ],
    my: { rank: "#12", initials: "TA", name: "Tôi (Tuấn Anh)", value: "68%", delta: "+8%", deltaPositive: true },
  },
  progress: {
    rows: [
      { rank: 1, initials: "QB", name: "Quốc Bảo", course: "Đàn tranh", value: "+18%", delta: "↑1", deltaPositive: true },
      { rank: 2, initials: "MA", name: "Minh Anh", course: "Đàn bầu", value: "+12%", delta: "↑3", deltaPositive: true },
      { rank: 3, initials: "GH", name: "Gia Hân", course: "Đàn bầu", value: "+10%", delta: "↑2", deltaPositive: true },
      { rank: 4, initials: "TA", name: "Tuấn Anh", course: "Đàn tranh", value: "+8%", delta: "↑5", deltaPositive: true },
      { rank: 5, initials: "PL", name: "Phương Linh", course: "Đàn tranh", value: "+5%", delta: "↓2", deltaPositive: false },
    ],
    my: { rank: "#4", initials: "TA", name: "Tôi (Tuấn Anh)", value: "+8%", delta: "↑5", deltaPositive: true },
  },
  streak: {
    rows: [
      { rank: 1, initials: "PL", name: "Phương Linh", course: "Đàn tranh", value: "21 ngày", delta: "+7", deltaPositive: true },
      { rank: 2, initials: "HT", name: "Hoàng Tùng", course: "Đàn tranh", value: "14 ngày", delta: "+0", deltaPositive: false },
      { rank: 3, initials: "MA", name: "Minh Anh", course: "Đàn bầu", value: "11 ngày", delta: "+3", deltaPositive: true },
      { rank: 4, initials: "GH", name: "Gia Hân", course: "Đàn bầu", value: "9 ngày", delta: "+1", deltaPositive: true },
      { rank: 5, initials: "QB", name: "Quốc Bảo", course: "Đàn tranh", value: "7 ngày", delta: "+7", deltaPositive: true },
    ],
    my: { rank: "#9", initials: "TA", name: "Tôi (Tuấn Anh)", value: "5 ngày", delta: "+2", deltaPositive: true },
  },
  active: {
    rows: [
      { rank: 1, initials: "MA", name: "Minh Anh", course: "Đàn bầu", value: "32 buổi", delta: "+4", deltaPositive: true },
      { rank: 2, initials: "PL", name: "Phương Linh", course: "Đàn tranh", value: "28 buổi", delta: "+2", deltaPositive: true },
      { rank: 3, initials: "QB", name: "Quốc Bảo", course: "Đàn tranh", value: "24 buổi", delta: "+6", deltaPositive: true },
      { rank: 4, initials: "HT", name: "Hoàng Tùng", course: "Đàn tranh", value: "19 buổi", delta: "-1", deltaPositive: false },
      { rank: 5, initials: "GH", name: "Gia Hân", course: "Đàn bầu", value: "16 buổi", delta: "+3", deltaPositive: true },
    ],
    my: { rank: "#11", initials: "TA", name: "Tôi (Tuấn Anh)", value: "12 buổi", delta: "+2", deltaPositive: true },
  },
};

// ─────────────────────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("accuracy");

  const { rows, my } = TAB_DATA[activeTab];

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader title="Bảng xếp hạng" variant="back" />

        {/* Tab tray */}
        <div className="mx-[14px] mb-[8px] shrink-0 rounded-[11px] bg-bvc-surface p-1">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] flex-1 cursor-pointer rounded-[8px] text-[13px] transition-colors ${
                  activeTab === tab.id
                    ? "bg-bvc-ink font-bold text-white"
                    : "font-medium text-bvc-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.rank}
              className="flex h-[52px] items-center gap-3 border-b border-bvc-line px-[14px]"
            >
              {/* Rank */}
              <span className="w-[28px] shrink-0 font-mono text-[13px] text-bvc-muted">
                {row.rank}
              </span>

              {/* Avatar */}
              <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-bvc-surface text-[13px] font-bold text-bvc-ink">
                {row.initials}
              </div>

              {/* Name + course */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[14px] font-semibold text-bvc-ink">
                  {row.name}
                </span>
                {row.course && (
                  <span className="truncate text-[11px] text-bvc-muted">
                    {row.course}
                  </span>
                )}
              </div>

              {/* Value + delta */}
              <div className="flex flex-col items-end">
                <span className="font-mono text-[14px] font-bold text-bvc-ink">
                  {row.value}
                </span>
                <span
                  className={`text-[12px] ${
                    row.deltaPositive ? "text-bvc-ok" : "text-bvc-accent-text"
                  }`}
                >
                  {row.delta}
                </span>
              </div>
            </div>
          ))}

          {/* My row — pinned */}
          <div className="mx-[14px] mt-[8px] flex h-[52px] items-center gap-3 rounded-[14px] bg-bvc-accent-tint px-[14px]">
            {/* Rank */}
            <span className="w-[28px] shrink-0 font-mono text-[13px] font-bold text-bvc-ink">
              {my.rank}
            </span>

            {/* Avatar */}
            <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-bvc-accent-tint text-[13px] font-bold text-bvc-ink">
              {my.initials}
            </div>

            {/* Name */}
            <div className="min-w-0 flex-1">
              <span className="truncate text-[14px] font-bold text-bvc-ink">
                {my.name}
              </span>
            </div>

            {/* Value + delta */}
            <div className="flex flex-col items-end">
              <span className="font-mono text-[14px] font-bold text-bvc-ink">
                {my.value}
              </span>
              <span
                className={`text-[12px] ${
                  my.deltaPositive ? "text-bvc-ok" : "text-bvc-accent-text"
                }`}
              >
                {my.delta}
              </span>
            </div>
          </div>

          <div className="h-[16px]" />
        </div>
      </div>
    </div>
  );
}
