import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Lớp học", to: "/teacher" },
  { label: "Lộ trình 6 tuần", to: "/teacher/roadmap" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review", badge: 18 },
  { label: "Thư viện bài nhạc", to: "/songs" },
  { label: "Thông báo", to: "/teacher/notifications" },
];

const WEEKS = [
  { code: "W1", label: "Làm quen nhạc cụ", done: true },
  { code: "W2", label: "Kỹ thuật + tác phẩm 1", done: true },
  { code: "W3", label: "Kiểm tra cá nhân", done: true },
  { code: "W4", label: "Chuẩn bị hòa tấu", current: true },
  { code: "W5", label: "Ghép nhóm", upcoming: true },
  { code: "W6", label: "Final Performance", upcoming: true },
];

const STUDENTS = [
  { name: "Trần Minh Anh", instrument: "Đàn tranh", group: "Nhóm 3", sessions: 18, accuracy: [60, 76, 88], status: "ok" },
  { name: "Lê Quốc Bảo", instrument: "Đàn bầu", group: "Nhóm 1", sessions: 9, accuracy: [52, 48, 54], status: "error" },
  { name: "Nguyễn Phương Linh", instrument: "Đàn tranh", group: "Nhóm 2", sessions: 14, accuracy: [70, 74, 79], status: "ok" },
  { name: "Phạm Gia Hân", instrument: "Đàn nhị", group: "Nhóm 4", sessions: 11, accuracy: [58, 62, 72], status: "warn" },
];

const STATUS_COLORS = {
  ok: { dot: "var(--color-bvc-ok)", label: "On Track", text: "text-bvc-ink" },
  warn: { dot: "var(--color-bvc-warn)", label: "At Risk", text: "text-bvc-muted" },
  error: { dot: "var(--color-bvc-error)", label: "Behind", text: "text-bvc-accent-text" },
};

export function TeacherPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar items={NAV_ITEMS} user={{ initials: "NH", name: "Nguyễn Thu Hương", role: "Giảng viên" }} />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="Học kỳ Fall 2026 · Tuần 4 / 6"
          title="TRD301 — Nhạc cụ truyền thống"
          actions={
            <>
              <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink">
                Giao bài tập
              </button>
              <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] bg-bvc-ink px-[16px] text-[14px] font-bold text-white">
                Gửi thông báo lớp
              </button>
            </>
          }
        />

        <div className="flex flex-1 gap-[20px] overflow-hidden p-[20px_32px_24px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-[12px]">
              <StatCard label="Sĩ số" value="32" />
              <StatCard label="On Track" value="24" variant="ok" />
              <StatCard label="At Risk" value="5" variant="surface" />
              <StatCard label="Behind" value="3" variant="accent" />
            </div>

            {/* Roadmap */}
            <div className="flex flex-col gap-[13px] rounded-[20px] border border-bvc-border bg-white p-[16px_18px]">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-bold">Lộ trình 6 tuần</span>
                <button type="button" className="cursor-pointer text-[13.5px] text-bvc-muted">Chỉnh sửa nội dung tuần</button>
              </div>
              <div className="grid grid-cols-6 gap-[10px]">
                {WEEKS.map((w) => (
                  <div
                    key={w.code}
                    className="flex flex-col gap-[3px] rounded-[14px] p-[11px_12px]"
                    style={{
                      backgroundColor: w.current ? "var(--color-bvc-accent-tint)" : "var(--color-bvc-surface)",
                      border: w.current ? "1px solid var(--color-bvc-accent)" : "none",
                    }}
                  >
                    <span
                      className="font-bvc-mono text-[12px]"
                      style={{
                        color: w.current ? "var(--color-bvc-accent-text)" : w.upcoming ? "var(--color-bvc-faint)" : "var(--color-bvc-ok)",
                        fontWeight: w.current ? 700 : undefined,
                      }}
                    >
                      {w.code}{w.current ? " · hiện tại" : ""}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        color: w.current ? "var(--color-bvc-accent-text)" : w.upcoming ? "var(--color-bvc-faint)" : "var(--color-bvc-ok)",
                        fontWeight: w.current ? 700 : undefined,
                      }}
                    >
                      {w.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Students table */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
              <div className="flex shrink-0 items-center justify-between gap-[16px] border-b border-bvc-border px-[18px] py-[15px]">
                <span className="text-[15px] font-bold">Tiến độ sinh viên</span>
                <div className="flex gap-[8px]">
                  <input type="search" placeholder="Tên, mã SV, nhạc cụ" className="h-[36px] w-[210px] rounded-[11px] border border-bvc-border-strong bg-white px-[11px] text-[13.5px] focus:outline-none" />
                  <button type="button" className="min-h-[36px] cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white px-[12px] text-[13.5px]">Lọc trạng thái</button>
                </div>
              </div>
              <div className="grid shrink-0 grid-cols-[2fr_1.2fr_0.8fr_1.1fr_1.4fr_1.1fr] gap-[12px] border-b border-bvc-border px-[18px] py-[10px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
                <span>Sinh viên</span><span>Nhạc cụ</span><span>Nhóm</span><span>Lượt luyện</span><span>Accuracy 3 lần gần nhất</span><span>Trạng thái</span>
              </div>
              {STUDENTS.map((s) => (
                <div
                  key={s.name}
                  className="grid grid-cols-[2fr_1.2fr_0.8fr_1.1fr_1.4fr_1.1fr] items-center gap-[12px] border-b border-bvc-line px-[18px] py-[13px] text-[14px] last:border-b-0"
                >
                  <span>{s.name}</span>
                  <span className="text-bvc-muted">{s.instrument}</span>
                  <span className="text-bvc-muted">{s.group}</span>
                  <span className="font-bvc-mono">{s.sessions}</span>
                  <span className="flex h-[24px] items-end gap-[4px]">
                    {s.accuracy.map((h, i) => (
                      <span
                        key={i}
                        className="w-[9px] rounded-[2px]"
                        style={{
                          height: `${h}%`,
                          backgroundColor: i === 2
                            ? (h >= 80 ? "var(--color-bvc-ok)" : h >= 60 ? "var(--color-bvc-warn)" : "var(--color-bvc-error)")
                            : "var(--color-bvc-bar)",
                        }}
                      />
                    ))}
                    <span
                      className="font-bvc-mono ml-[6px] text-[13px]"
                      style={{ color: STATUS_COLORS[s.status as keyof typeof STATUS_COLORS].dot }}
                    >
                      {s.accuracy[2]}%
                    </span>
                  </span>
                  <span className={`flex items-center gap-[6px] text-[13.5px] ${STATUS_COLORS[s.status as keyof typeof STATUS_COLORS].text}`}>
                    <span className="size-[8px] shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status as keyof typeof STATUS_COLORS].dot }} />
                    {STATUS_COLORS[s.status as keyof typeof STATUS_COLORS].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
