import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { FilterChips } from "@/shared/components/bvc/FilterChips";
import { ScoreBar } from "@/shared/components/bvc/ScoreBar";

// ── Mock data ─────────────────────────────────────────────────────────────────

const FILTER_CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
];

interface HistoryItem {
  id: string;
  index: number;
  dateLabel: string;
  score: number;
  pitch: number;
  rhythm: number;
  songLabel: string;
  barRange: string;
  duration: string;
}

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: "5",
    index: 5,
    dateLabel: "Hôm nay, 14:32",
    score: 82,
    pitch: 88,
    rhythm: 74,
    songLabel: "Lý ngựa ô",
    barRange: "Bar 1–32",
    duration: "2:41",
  },
  {
    id: "4",
    index: 4,
    dateLabel: "Hôm nay, 10:11",
    score: 79,
    pitch: 84,
    rhythm: 70,
    songLabel: "Lý ngựa ô",
    barRange: "Bar 1–32",
    duration: "2:38",
  },
  {
    id: "3",
    index: 3,
    dateLabel: "Hôm qua, 19:05",
    score: 78,
    pitch: 82,
    rhythm: 66,
    songLabel: "Lý ngựa ô",
    barRange: "Bar 1–32",
    duration: "2:44",
  },
  {
    id: "2",
    index: 2,
    dateLabel: "2 ngày trước, 20:14",
    score: 74,
    pitch: 78,
    rhythm: 62,
    songLabel: "Lý ngựa ô",
    barRange: "Bar 1–32",
    duration: "2:52",
  },
  {
    id: "1",
    index: 1,
    dateLabel: "3 ngày trước, 09:30",
    score: 71,
    pitch: 74,
    rhythm: 68,
    songLabel: "Lý ngựa ô",
    barRange: "Bar 1–32",
    duration: "2:55",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader
          variant="back"
          title="Lịch sử luyện tập"
          subtitle="Lý ngựa ô"
        />

        {/* Filter chips */}
        <div className="shrink-0 pb-[10px]">
          <FilterChips
            chips={FILTER_CHIPS}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pb-[16px]">
          {HISTORY_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(-1)}
              className="mx-[14px] mb-[8px] block w-[calc(100%-28px)] cursor-pointer rounded-[18px] border border-bvc-border p-[13px] text-left"
            >
              {/* Row 1 */}
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-bvc-ink">
                  Bản thu #{item.index} · {item.dateLabel}
                </span>
                <span className="font-bvc-mono text-[14px] font-semibold text-bvc-ok">
                  {item.score}%
                </span>
              </div>

              {/* Row 2 — mini score bars */}
              <div className="mt-[8px] flex flex-col gap-[6px]">
                <ScoreBar label="Cao độ" score={item.pitch} />
                <ScoreBar label="Nhịp" score={item.rhythm} />
              </div>

              {/* Row 3 */}
              <div className="mt-[8px] text-[12px] text-bvc-muted">
                {item.songLabel} · {item.barRange} · {item.duration}
              </div>
            </button>
          ))}

          {/* Summary footer */}
          <div className="mx-[14px] mt-[4px] rounded-[14px] bg-bvc-surface p-[12px] text-center">
            <span className="text-[13px] font-medium text-bvc-muted">
              5 bản thu · Trung bình 77%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
