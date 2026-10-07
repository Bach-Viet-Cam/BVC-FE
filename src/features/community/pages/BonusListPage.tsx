import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { FilterChips } from "@/shared/components/bvc/FilterChips";
import { StatusDot } from "@/shared/components/bvc/StatusDot";

// ── Types ─────────────────────────────────────────────────────────────────────

type BonusStatus = "open" | "done" | "expired";
type Difficulty = "Cơ bản" | "Trung cấp" | "Nâng cao";

interface BonusItem {
  id: string;
  title: string;
  points: string;
  deadline: string;
  difficulty: Difficulty;
  participants: number;
  status: BonusStatus;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const FILTER_CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Đang mở" },
  { value: "done", label: "Đã làm" },
  { value: "expired", label: "Hết hạn" },
];

const BONUS_ITEMS: BonusItem[] = [
  {
    id: "b1",
    title: "Recording Lý ngựa ô — bè thứ 2",
    points: "+2",
    deadline: "30/09",
    difficulty: "Trung cấp",
    participants: 14,
    status: "open",
  },
  {
    id: "b2",
    title: "Sáng tác câu dạo đàn tranh",
    points: "+1",
    deadline: "28/09",
    difficulty: "Nâng cao",
    participants: 6,
    status: "open",
  },
  {
    id: "b3",
    title: "Recording scale Sol trưởng x60 BPM",
    points: "+1",
    deadline: "20/09",
    difficulty: "Cơ bản",
    participants: 31,
    status: "done",
  },
  {
    id: "b4",
    title: "Chép tay bản nhạc Trống cơm",
    points: "+2",
    deadline: "15/09",
    difficulty: "Cơ bản",
    participants: 22,
    status: "expired",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function BonusListPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered =
    activeFilter === "all"
      ? BONUS_ITEMS
      : BONUS_ITEMS.filter((item) => item.status === activeFilter);

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader title="Bonus Assignments" variant="back" />

        {/* Filter chips */}
        <div className="shrink-0 pb-[10px]">
          <FilterChips
            chips={FILTER_CHIPS}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-[14px] pb-[16px]">
          <div className="flex flex-col gap-[8px]">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/community/bonus/${item.id}`)}
                className={`w-full cursor-pointer rounded-[18px] border border-bvc-border p-[14px] text-left ${
                  item.status === "expired" ? "opacity-50" : ""
                }`}
              >
                {/* Top row: title + points badge */}
                <div className="flex items-start justify-between gap-[8px]">
                  <span className="text-[14px] font-bold leading-snug text-bvc-ink">
                    {item.title}
                  </span>
                  <span className="shrink-0 rounded-[9px] bg-bvc-accent-tint px-2 py-0.5 font-mono text-[13px] font-bold text-bvc-accent-text">
                    {item.points}
                  </span>
                </div>

                {/* Bottom row: meta info + status */}
                <div className="mt-[8px] flex items-center justify-between">
                  <span className="text-[12px] text-bvc-muted">
                    {item.difficulty} · {item.participants} người · Hạn{" "}
                    {item.deadline}
                  </span>
                  {item.status === "done" && (
                    <StatusDot status="ok" size={7} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
