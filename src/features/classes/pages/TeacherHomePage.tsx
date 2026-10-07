import { useNavigate } from "react-router-dom";
import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Trang chủ GV", to: "/teacher/home" },
  { label: "Danh sách lớp", to: "/teacher/classes" },
  { label: "Lộ trình học tập", to: "/teacher/roadmap" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review", badge: 18 },
  { label: "Thư viện bài nhạc", to: "/songs" },
];

const CLASSES = [
  { code: "TRD301", name: "Nhạc cụ truyền thống", semester: "Fall 2026", students: 28, week: 4, onTrack: 19, atRisk: 6, behind: 3 },
  { code: "TRD201", name: "Nhạc cụ cơ bản", semester: "Fall 2026", students: 32, week: 3, onTrack: 25, atRisk: 5, behind: 2 },
  { code: "TRD401", name: "Hòa tấu nâng cao", semester: "Fall 2026", students: 18, week: 5, onTrack: 14, atRisk: 3, behind: 1 },
];

export function TeacherHomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "NH", name: "Nguyễn Thu Hương", role: "Giảng viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M00-04 · Trang chủ giảng viên"
          title="Trang chủ"
          actions={
            <button
              type="button"
              onClick={() => navigate("/teacher/assignments/new")}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Giao bài tập mới
            </button>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          {/* Top stats */}
          <div className="grid grid-cols-3 gap-[12px]">
            <StatCard label="Lớp đang dạy" value="3" />
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-accent bg-bvc-accent-tint p-[15px_16px]">
              <span className="text-[12.5px] font-semibold text-bvc-accent-text">Bài chờ duyệt</span>
              <span className="font-mono text-[29px] font-semibold leading-none text-bvc-accent-text">18</span>
            </div>
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-border p-[15px_16px]">
              <span className="flex items-center gap-[7px] text-[12.5px] text-bvc-muted">
                <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
                Sinh viên cần chú ý
              </span>
              <span className="font-mono text-[29px] font-semibold leading-none text-bvc-ink">5</span>
            </div>
          </div>

          {/* Class list section */}
          <div className="flex flex-col gap-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-extrabold tracking-[-0.025em]">Lớp học kỳ Fall 2026</span>
              <button
                type="button"
                onClick={() => navigate("/teacher/classes")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
              >
                Xem tất cả lớp
              </button>
            </div>

            <div className="grid grid-cols-3 gap-[14px]">
              {CLASSES.map((cls) => (
                <div
                  key={cls.code}
                  className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border p-[16px]"
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                      {cls.code}
                    </span>
                    <div className="mt-1 text-[16px] font-bold text-bvc-ink">{cls.name}</div>
                    <div className="mt-1 text-[13px] text-bvc-muted">
                      Tuần {cls.week}/6 · {cls.students} sinh viên
                    </div>
                  </div>
                  <div className="flex items-center gap-[14px]">
                    <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
                      {cls.onTrack}
                    </span>
                    <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
                      {cls.atRisk}
                    </span>
                    <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-error" />
                      {cls.behind}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action items */}
          <div className="flex flex-col rounded-[20px] border border-bvc-border bg-white">
            <div className="border-b border-bvc-border px-[20px] py-[14px]">
              <span className="text-[15px] font-extrabold tracking-[-0.025em]">Cần xử lý hôm nay</span>
            </div>

            <div className="flex items-center gap-3 border-b border-bvc-line px-[20px] min-h-[52px]">
              <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
              <span className="flex-1 text-[14px] text-bvc-ink">
                18 bài nộp chờ duyệt — TRD301 tuần 3
              </span>
              <button
                type="button"
                onClick={() => navigate("/teacher/review")}
                className="flex min-h-[36px] cursor-pointer items-center rounded-[12px] bg-bvc-ink px-[14px] text-[13px] font-bold text-white"
              >
                Duyệt ngay
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-bvc-line px-[20px] min-h-[52px]">
              <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
              <span className="flex-1 text-[14px] text-bvc-ink">
                Nhóm 2 TRD401 thiếu bè đàn bầu
              </span>
              <button
                type="button"
                onClick={() => navigate("/teacher/classes")}
                className="flex min-h-[36px] cursor-pointer items-center rounded-[12px] border border-bvc-border-strong bg-white px-[14px] text-[13px] font-semibold text-bvc-ink"
              >
                Xem lớp
              </button>
            </div>

            <div className="flex items-center gap-3 px-[20px] min-h-[52px]">
              <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
              <span className="flex-1 text-[14px] text-bvc-ink">
                5 sinh viên hoàn thành bonus assignment
              </span>
              <button
                type="button"
                className="flex min-h-[36px] cursor-pointer items-center rounded-[12px] border border-bvc-border-strong bg-white px-[14px] text-[13px] font-semibold text-bvc-ink"
              >
                Xem kết quả
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => navigate("/teacher/assignments/new")}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Giao bài tập mới
            </button>
            <button
              type="button"
              onClick={() => navigate("/teacher/review")}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
            >
              Duyệt bài nộp
            </button>
            <button
              type="button"
              onClick={() => navigate("/songs")}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
            >
              Thư viện bài nhạc
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
