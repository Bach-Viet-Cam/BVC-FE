import { useNavigate } from "react-router-dom";
import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const TEACHER_NAV = [
  { label: "Trang chủ GV", to: "/teacher/home" },
  { label: "Danh sách lớp", to: "/teacher/classes" },
  { label: "Lộ trình học tập", to: "/teacher/roadmap" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review", badge: 18 },
  { label: "Thư viện bài nhạc", to: "/songs" },
];

type AssignmentStatus = "pending" | "done" | "active";

interface Assignment {
  title: string;
  type: "Recording" | "Luyện ngón";
  course: string;
  deadline: string;
  submitted: string;
  pending: number;
  status: AssignmentStatus;
}

const ASSIGNMENTS: Assignment[] = [
  {
    title: "Recording hòa tấu — Trống cơm",
    type: "Recording",
    course: "TRD301",
    deadline: "26/09",
    submitted: "24/28",
    pending: 18,
    status: "pending",
  },
  {
    title: "Luyện ngón scale Rê thứ",
    type: "Luyện ngón",
    course: "TRD301",
    deadline: "25/09",
    submitted: "28/28",
    pending: 0,
    status: "done",
  },
  {
    title: "Recording Lý ngựa ô",
    type: "Recording",
    course: "TRD201",
    deadline: "19/09",
    submitted: "30/32",
    pending: 0,
    status: "done",
  },
  {
    title: "Scale Sol trưởng x80 BPM",
    type: "Luyện ngón",
    course: "TRD401",
    deadline: "23/09",
    submitted: "16/18",
    pending: 2,
    status: "pending",
  },
  {
    title: "Bèo dạt mây trôi",
    type: "Recording",
    course: "TRD301",
    deadline: "12/09",
    submitted: "28/28",
    pending: 0,
    status: "done",
  },
  {
    title: "Ensemble tuần 5",
    type: "Recording",
    course: "TRD401",
    deadline: "30/09",
    submitted: "5/18",
    pending: 5,
    status: "active",
  },
];

export function TeacherAssignmentsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={TEACHER_NAV}
        user={{ initials: "NH", name: "Nguyễn Thu Hương", role: "Giảng viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M03 · Lớp học"
          title="Danh sách bài tập"
          actions={
            <>
              <select className="h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none">
                <option>TRD301</option>
                <option>TRD201</option>
                <option>TRD401</option>
              </select>
              <button
                type="button"
                onClick={() => navigate("/teacher/assignments/new")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Tạo bài tập
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Tổng bài tập" value="24" />
            <StatCard label="Chờ duyệt" value="18" variant="accent" />
            <StatCard label="Đã chấm" value="6" />
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-border p-[15px_16px]">
              <span className="flex items-center gap-[7px] text-[12.5px] text-bvc-muted">
                <span
                  className="size-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--color-bvc-warn)" }}
                />
                Quá hạn
              </span>
              <span className="font-mono text-[29px] font-semibold leading-none text-bvc-ink">
                2
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            {/* Table header */}
            <div className="grid shrink-0 grid-cols-[2.4fr_1.1fr_0.8fr_0.8fr_0.9fr_0.9fr_0.8fr] gap-[12px] border-b border-bvc-border px-[20px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
              <span>Tiêu đề</span>
              <span>Loại</span>
              <span>Lớp</span>
              <span>Hạn nộp</span>
              <span>Đã nộp</span>
              <span>Chờ duyệt</span>
              <span>Hành động</span>
            </div>

            {/* Table rows */}
            {ASSIGNMENTS.map((a) => (
              <div
                key={a.title}
                className="grid h-[54px] grid-cols-[2.4fr_1.1fr_0.8fr_0.8fr_0.9fr_0.9fr_0.8fr] items-center gap-[12px] border-b border-bvc-line px-[20px] text-[13px] last:border-0"
              >
                <span className="truncate font-semibold text-bvc-ink">{a.title}</span>

                <span>
                  {a.type === "Recording" ? (
                    <span className="rounded-[9px] bg-bvc-accent-tint px-2 py-0.5 text-[12px] font-semibold text-bvc-accent-text">
                      {a.type}
                    </span>
                  ) : (
                    <span className="rounded-[9px] bg-bvc-surface px-2 py-0.5 text-[12px] font-semibold text-bvc-muted">
                      {a.type}
                    </span>
                  )}
                </span>

                <span className="text-bvc-muted">{a.course}</span>

                <span className="font-mono text-bvc-muted">{a.deadline}</span>

                <span className="font-mono text-bvc-ink">{a.submitted}</span>

                <span
                  className={`font-mono ${a.pending > 0 ? "font-bold text-bvc-accent-text" : "text-bvc-muted"}`}
                >
                  {a.pending > 0 ? a.pending : "—"}
                </span>

                <span>
                  {a.pending > 0 ? (
                    <button
                      type="button"
                      className="flex h-[34px] cursor-pointer items-center rounded-[10px] border border-bvc-border px-3 text-[13px] font-semibold text-bvc-accent-text"
                    >
                      Duyệt
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex h-[34px] cursor-pointer items-center rounded-[10px] border border-bvc-border px-3 text-[13px] font-semibold text-bvc-muted"
                    >
                      Xem
                    </button>
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
