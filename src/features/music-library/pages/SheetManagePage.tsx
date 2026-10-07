import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Lớp học", to: "/teacher" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review" },
  { label: "Thư viện bài nhạc", to: "/songs" },
  { label: "Phân loại nội dung", to: "/categories" },
];

interface SheetRow {
  name: string;
  song: string;
  instrument: string;
  format: string;
  size: string;
  status: "ok" | "warn";
  statusLabel: string;
}

const SHEETS: SheetRow[] = [
  { name: "Lý ngựa ô - Đàn tranh", song: "Lý ngựa ô", instrument: "Đàn tranh", format: "PDF", size: "1.2 MB", status: "ok", statusLabel: "Verified" },
  { name: "Lý ngựa ô - Đàn bầu", song: "Lý ngựa ô", instrument: "Đàn bầu", format: "PDF", size: "0.9 MB", status: "ok", statusLabel: "Verified" },
  { name: "Trống cơm - Đàn tranh", song: "Trống cơm", instrument: "Đàn tranh", format: "PDF+MusicXML", size: "2.1 MB", status: "ok", statusLabel: "Verified" },
  { name: "Lưu thủy kim tiền - Đàn tranh", song: "Lưu thủy kim tiền", instrument: "Đàn tranh", format: "PDF", size: "1.5 MB", status: "warn", statusLabel: "Chờ duyệt" },
  { name: "Bèo dạt mây trôi - Đàn tranh", song: "Bèo dạt mây trôi", instrument: "Đàn tranh", format: "PDF", size: "0.8 MB", status: "warn", statusLabel: "Chờ duyệt" },
  { name: "Se chỉ luồn kim - Đàn nhị", song: "Se chỉ luồn kim", instrument: "Đàn nhị", format: "MusicXML", size: "0.3 MB", status: "ok", statusLabel: "Verified" },
];

const STATUS_COLORS = {
  ok: "var(--color-bvc-ok)",
  warn: "var(--color-bvc-warn)",
};

export function SheetManagePage() {
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
          title="Quản lý bản nhạc"
          actions={
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Tải lên bản nhạc
            </button>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-hidden p-[22px_32px_26px]">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Tổng bản nhạc" value="137" />
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-border p-[15px_16px]">
              <span className="flex items-center gap-[7px] text-[12.5px] text-bvc-muted">
                <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
                Chờ duyệt
              </span>
              <span className="font-bvc-mono text-[29px] font-semibold leading-none">6</span>
            </div>
            <StatCard label="File PDF" value="119" />
            <StatCard label="File MusicXML" value="18" />
          </div>

          {/* Sheet table */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            {/* Toolbar */}
            <div className="flex shrink-0 items-center justify-between gap-[16px] border-b border-bvc-border px-[18px] py-[15px]">
              <span className="text-[15px] font-bold text-bvc-ink">Danh sách bản nhạc</span>
              <div className="flex items-center gap-[8px]">
                <input
                  type="search"
                  placeholder="Tên bản nhạc, bài nhạc, nhạc cụ"
                  className="h-[38px] w-[280px] rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13px] text-bvc-ink focus:outline-none"
                />
                <button
                  type="button"
                  className="min-h-[38px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-[13px] text-[13px] text-bvc-ink"
                >
                  Lọc trạng thái
                </button>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid shrink-0 grid-cols-[2fr_1.4fr_1.2fr_1.1fr_1fr_1fr] gap-[14px] border-b border-bvc-border px-[18px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
              <span>Bản nhạc</span>
              <span>Bài nhạc</span>
              <span>Nhạc cụ</span>
              <span>Định dạng</span>
              <span>Dung lượng</span>
              <span>Trạng thái</span>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {SHEETS.map((sheet) => (
                <div
                  key={sheet.name}
                  className="grid grid-cols-[2fr_1.4fr_1.2fr_1.1fr_1fr_1fr] items-center gap-[14px] border-b border-bvc-border px-[18px] py-[14px] text-[14px] last:border-b-0"
                >
                  <span className="font-semibold text-bvc-ink">{sheet.name}</span>
                  <span className="text-bvc-muted">{sheet.song}</span>
                  <span className="text-bvc-muted">{sheet.instrument}</span>
                  <span className="font-bvc-mono text-[13px] text-bvc-muted">{sheet.format}</span>
                  <span className="font-bvc-mono text-[13px] text-bvc-muted">{sheet.size}</span>
                  <span className="flex items-center gap-[7px] text-[13.5px]">
                    <span
                      className="size-[7px] shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[sheet.status] }}
                    />
                    <span style={{ color: STATUS_COLORS[sheet.status] }}>
                      {sheet.statusLabel}
                    </span>
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
