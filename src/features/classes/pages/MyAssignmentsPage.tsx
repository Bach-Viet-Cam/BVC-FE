import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterChips, MobileHeader, TagBadge } from "@/shared/components/bvc";

type TagVariant = "verified" | "community" | "pending" | "error" | "ok" | "warn" | "muted";

interface Assignment {
  id: string;
  title: string;
  statusLabel: string;
  statusVariant: TagVariant;
  course: string;
  week: number;
  deadline: string;
}

const ASSIGNMENTS: Assignment[] = [
  {
    id: "week4-ensemble",
    title: "Recording hòa tấu — Trống cơm",
    statusLabel: "Chưa nộp",
    statusVariant: "warn",
    course: "TRD301",
    week: 4,
    deadline: "26/09",
  },
  {
    id: "week3-ly-ngua-o",
    title: "Recording Lý ngựa ô",
    statusLabel: "82%",
    statusVariant: "ok",
    course: "TRD301",
    week: 3,
    deadline: "19/09",
  },
  {
    id: "week4-scale",
    title: "Luyện ngón scale Rê thứ",
    statusLabel: "Chờ chấm",
    statusVariant: "muted",
    course: "TRD301",
    week: 4,
    deadline: "25/09",
  },
  {
    id: "week2-beo-dat",
    title: "Recording Bèo dạt mây trôi",
    statusLabel: "91%",
    statusVariant: "ok",
    course: "TRD301",
    week: 2,
    deadline: "12/09",
  },
  {
    id: "week1-bonus",
    title: "Bonus: Recording tự chọn",
    statusLabel: "Đạt",
    statusVariant: "ok",
    course: "TRD301",
    week: 1,
    deadline: "05/09",
  },
];

const CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "chua-nop", label: "Chưa nộp" },
  { value: "cho-cham", label: "Chờ chấm" },
  { value: "da-cham", label: "Đã chấm" },
];

function filterAssignment(a: Assignment, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "chua-nop") return a.statusVariant === "warn";
  if (filter === "cho-cham") return a.statusVariant === "muted";
  if (filter === "da-cham") return a.statusVariant === "ok";
  return true;
}

export function MyAssignmentsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = ASSIGNMENTS.filter((a) => filterAssignment(a, activeFilter));

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Bài tập của tôi" />

        {/* Filter chips */}
        <div className="shrink-0 pb-[2px]">
          <FilterChips
            chips={CHIPS}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </div>

        {/* Assignment list */}
        <div className="flex-1 overflow-y-auto pt-3">
          {filtered.map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              onClick={() => navigate(`/assignment/${assignment.id}`)}
              className="mx-[14px] mb-3 block w-[calc(100%-28px)] cursor-pointer rounded-[18px] border border-bvc-border p-[13px] text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex-1 text-[14px] font-bold leading-snug text-bvc-ink">
                  {assignment.title}
                </span>
                <TagBadge
                  label={assignment.statusLabel}
                  variant={assignment.statusVariant}
                />
              </div>
              <p className="mt-1 text-[12px] text-bvc-muted">
                {assignment.course} · Tuần {assignment.week} · Hạn: {assignment.deadline}
              </p>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center px-[14px] pt-12">
              <p className="text-[14px] text-bvc-muted">Không có bài tập nào</p>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
