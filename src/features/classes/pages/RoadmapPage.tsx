import { DesktopSidebar, DesktopPageHeader } from "@/shared/components/bvc";
import { Check, Music } from "lucide-react";

const NAV_ITEMS = [
  { label: "Trang chủ GV", to: "/teacher/home" },
  { label: "Danh sách lớp", to: "/teacher/classes" },
  { label: "Lộ trình học tập", to: "/teacher/roadmap" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review", badge: 18 },
  { label: "Thư viện bài nhạc", to: "/songs" },
];

interface WeekItem {
  num: number;
  title: string;
  content: string;
  assignment: string;
  done?: boolean;
  current?: boolean;
  upcoming?: boolean;
}

const WEEKS: WeekItem[] = [
  { num: 1, title: "Làm quen nhạc cụ", content: "Tư thế, cách cầm, vị trí ngón cơ bản", assignment: "Scale Đô trưởng", done: true },
  { num: 2, title: "Kỹ thuật cơ bản", content: "Luyện ngón, bài tập nhịp 4/4", assignment: "Bèo dạt mây trôi", done: true },
  { num: 3, title: "Tác phẩm 1", content: "Lý ngựa ô — bè chính + kiểm tra", assignment: "Recording Lý ngựa ô", done: true },
  { num: 4, title: "Hòa tấu", content: "Ghép bè, nghe nhau, đồng bộ tempo", assignment: "Recording Trống cơm", current: true },
  { num: 5, title: "Ghép nhóm", content: "Full ensemble 2 bè trở lên", assignment: "Ensemble performance", upcoming: true },
  { num: 6, title: "Final Performance", content: "Trình diễn cuối kỳ, tổng kết", assignment: "Final recording", upcoming: true },
];

const ASSIGNMENT_TABLE = [
  { week: 1, assignment: "Scale Đô trưởng", type: "Luyện ngón", status: "done" },
  { week: 2, assignment: "Bèo dạt mây trôi", type: "Recording", status: "done" },
  { week: 3, assignment: "Recording Lý ngựa ô", type: "Recording", status: "done" },
  { week: 4, assignment: "Recording Trống cơm", type: "Recording", status: "active" },
  { week: 5, assignment: "Ensemble performance", type: "Hòa tấu", status: "upcoming" },
  { week: 6, assignment: "Final recording", type: "Recording", status: "upcoming" },
];

function weekCardClass(w: WeekItem): string {
  if (w.current) return "border-bvc-accent bg-bvc-accent-tint";
  if (w.done) return "border-bvc-border bg-bvc-surface";
  return "border-bvc-border bg-white";
}

export function RoadmapPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "NH", name: "Nguyễn Thu Hương", role: "Giảng viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="TRD301 · Fall 2026"
          title="Lộ trình học tập 6 tuần"
          actions={
            <>
              <select className="h-[44px] rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none">
                <option>Fall 2026</option>
                <option>Spring 2026</option>
                <option>Fall 2025</option>
              </select>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Lưu thay đổi
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          {/* 6-week grid */}
          <div className="grid grid-cols-6 gap-[14px]">
            {WEEKS.map((w) => (
              <div
                key={w.num}
                className={`flex flex-col gap-[10px] rounded-[20px] border p-[14px] ${weekCardClass(w)}`}
              >
                {/* Week header row */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                    Tuần {w.num}
                  </span>
                  {w.done && (
                    <span className="size-[18px] shrink-0 rounded-full bg-bvc-ok flex items-center justify-center">
                      <Check size={11} color="white" />
                    </span>
                  )}
                  {w.current && (
                    <span className="size-[7px] rounded-full bg-bvc-accent" />
                  )}
                </div>

                {/* Title */}
                <div
                  className={`border-b border-transparent text-[13px] font-bold text-bvc-ink hover:border-bvc-border-strong ${w.current ? "text-bvc-accent-text" : ""}`}
                >
                  {w.title}
                </div>

                {/* Content */}
                <p className="text-[12px] leading-[1.5] text-bvc-muted">{w.content}</p>

                {/* Assignment */}
                <div className="flex items-center gap-[6px]">
                  <Music size={14} className="shrink-0 text-bvc-muted" />
                  <span className="text-[12px] font-semibold text-bvc-ink">{w.assignment}</span>
                </div>

                {/* Edit button */}
                <button
                  type="button"
                  className="mt-auto cursor-pointer pt-2 text-left text-[12px] font-semibold text-bvc-accent-text"
                >
                  Chỉnh sửa
                </button>
              </div>
            ))}
          </div>

          {/* Assignment table */}
          <div className="flex flex-col rounded-[20px] border border-bvc-border bg-white overflow-hidden">
            <div className="border-b border-bvc-border px-[20px] py-[14px]">
              <span className="text-[15px] font-extrabold tracking-[-0.025em]">Bài tập gắn kèm theo tuần</span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr] items-center gap-[14px] border-b border-bvc-border bg-bvc-surface px-[20px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted h-[40px]">
              <span>Tuần</span>
              <span>Bài tập</span>
              <span>Loại</span>
              <span>Trạng thái</span>
            </div>

            {ASSIGNMENT_TABLE.map((row) => (
              <div
                key={row.week}
                className="grid grid-cols-[0.5fr_2fr_1fr_1fr] items-center gap-[14px] border-b border-bvc-line px-[20px] last:border-0 h-[44px] text-[13px]"
              >
                <span className="font-mono text-bvc-muted">{row.week}</span>
                <span className="text-bvc-ink">{row.assignment}</span>
                <span className="text-bvc-muted">{row.type}</span>
                <span className="flex items-center gap-[6px] text-bvc-ink">
                  {row.status === "done" && (
                    <>
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
                      Hoàn thành
                    </>
                  )}
                  {row.status === "active" && (
                    <>
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
                      Đang mở
                    </>
                  )}
                  {row.status === "upcoming" && (
                    <>
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-bar-strong" />
                      Sắp tới
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
