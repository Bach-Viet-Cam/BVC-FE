import { useNavigate } from "react-router-dom";
import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Lớp học", to: "/teacher" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review" },
  { label: "Thư viện bài nhạc", to: "/songs" },
  { label: "Phân loại nội dung", to: "/categories" },
];

const SONGS = [
  { name: "Lý ngựa ô", genre: "Dân ca Nam Bộ", level: "Trung cấp", sheets: "4 / 4", updated: "12/09", status: "ok", statusLabel: "Verified", highlight: false },
  { name: "Trống cơm", genre: "Dân ca Bắc Bộ", level: "Hòa tấu", sheets: "5 / 5", updated: "10/09", status: "ok", statusLabel: "Verified", highlight: false },
  { name: "Lưu thủy kim tiền", genre: "Nhạc lễ", level: "Nâng cao", sheets: "2 / 4", updated: "06/09", status: "error", statusLabel: "Thiếu bản nhạc", highlight: true },
  { name: "Bèo dạt mây trôi", genre: "Dân ca · cộng đồng", level: "Cơ bản", sheets: "1 / 4", updated: "15/09", status: "warn", statusLabel: "Chờ duyệt", highlight: false },
  { name: "Se chỉ luồn kim", genre: "Quan họ Bắc Ninh", level: "Cơ bản", sheets: "3 / 4", updated: "02/09", status: "ok", statusLabel: "Verified", highlight: false },
  { name: "Ru con Nam Bộ", genre: "Dân ca Nam Bộ", level: "Cơ bản", sheets: "4 / 4", updated: "28/08", status: "ok", statusLabel: "Verified", highlight: false },
] as const;

const STATUS_COLORS = {
  ok: "var(--color-bvc-ok)",
  warn: "var(--color-bvc-warn)",
  error: "var(--color-bvc-error)",
};

export function SongManagePage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "NH", name: "Nguyễn Thu Hương", role: "Giảng viên" }}
        showLogo={false}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M02 · Thư viện học liệu"
          title="Quản lý bài nhạc"
          actions={
            <>
              <button type="button" className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink">
                Quản lý bản nhạc
              </button>
              <button
                type="button"
                onClick={() => navigate("/songs/new")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Tạo bài nhạc
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-hidden p-[22px_32px_26px]">
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Bài nhạc" value="42" />
            <StatCard label="Bản nhạc" value="137" />
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-border p-[15px_16px]">
              <span className="flex items-center gap-[7px] text-[12.5px] text-bvc-muted">
                <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />Chờ duyệt
              </span>
              <span className="font-bvc-mono text-[29px] font-semibold leading-none">6</span>
            </div>
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-border p-[15px_16px]">
              <span className="flex items-center gap-[7px] text-[12.5px] text-bvc-muted">
                <span className="size-[7px] shrink-0 rounded-full bg-bvc-error" />Thiếu bản nhạc
              </span>
              <span className="font-bvc-mono text-[29px] font-semibold leading-none">3</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            <div className="flex shrink-0 items-center justify-between gap-[16px] border-b border-bvc-border px-[18px] py-[15px]">
              <span className="text-[15px] font-bold">Danh sách bài nhạc</span>
              <div className="flex items-center gap-[8px]">
                <label className="text-[13px] text-bvc-muted">Tìm</label>
                <input
                  type="search"
                  placeholder="Tên bài, tác giả, thể loại"
                  className="h-[38px] w-[260px] rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13px] text-bvc-ink focus:outline-none"
                />
                <button type="button" className="min-h-[38px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-[13px] text-[13px] text-bvc-ink">
                  Lọc trạng thái
                </button>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-[2.2fr_1.4fr_1fr_1.2fr_1.1fr_1fr] gap-[14px] border-b border-bvc-border px-[18px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
              <span>Bài nhạc</span><span>Thể loại</span><span>Độ khó</span><span>Bản nhạc</span><span>Cập nhật</span><span>Trạng thái</span>
            </div>

            {SONGS.map((song) => (
              <button
                key={song.name}
                type="button"
                onClick={() => navigate(`/songs/${encodeURIComponent(song.name)}`)}
                className="grid w-full cursor-pointer grid-cols-[2.2fr_1.4fr_1fr_1.2fr_1.1fr_1fr] items-center gap-[14px] border-b border-bvc-line px-[18px] py-[14px] text-left text-[14px] last:border-b-0"
                style={{ backgroundColor: song.highlight ? "var(--color-bvc-accent-tint)" : undefined }}
              >
                <span className="font-semibold">{song.name}</span>
                <span className="text-bvc-muted">{song.genre}</span>
                <span className="text-bvc-muted">{song.level}</span>
                <span
                  className="font-bvc-mono"
                  style={{ color: song.status === "error" ? "var(--color-bvc-accent-text)" : undefined }}
                >
                  {song.sheets} nhạc cụ
                </span>
                <span className="text-bvc-muted">{song.updated}</span>
                <span className="flex items-center gap-[7px] text-[13.5px]">
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[song.status] }}
                  />
                  {song.statusLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
