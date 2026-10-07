import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
  { label: "Duyệt nội dung", to: "/community/approval" },
  { label: "Quản lý bài nhạc", to: "/songs" },
  { label: "Cấu hình", to: "/admin/config" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentType = "Bản thu" | "Bản nhạc" | "Arrangement";

interface VerifiedRow {
  name: string;
  type: ContentType;
  contributor: string;
  key: string;
  uses: number;
  date: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ROWS: VerifiedRow[] = [
  { name: "Lý ngựa ô — bè đàn tranh (bản 3)", type: "Bản thu",    contributor: "Phương Linh",   key: "G", uses: 24, date: "15/09" },
  { name: "Trống cơm — full score",            type: "Bản nhạc",  contributor: "GV Thu Hương",  key: "C", uses: 31, date: "10/09" },
  { name: "Bèo dạt — arrangement jazz",        type: "Arrangement", contributor: "Minh Anh",    key: "F", uses: 8,  date: "05/09" },
  { name: "Scale Rê thứ x80 BPM",              type: "Bản thu",    contributor: "Quốc Bảo",     key: "D", uses: 17, date: "22/08" },
  { name: "Lưu thủy — version chuẩn",          type: "Bản nhạc",  contributor: "GV Thu Hương",  key: "A", uses: 42, date: "01/09" },
  { name: "Hát ru — arrangement cổ điển",      type: "Arrangement", contributor: "Gia Hân",     key: "G", uses: 6,  date: "18/09" },
];

// ── Badge helper ──────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ContentType }) {
  const cls =
    type === "Bản thu"
      ? "bg-bvc-surface text-bvc-muted"
      : type === "Bản nhạc"
        ? "border border-bvc-border text-bvc-ink"
        : "bg-bvc-accent-tint text-bvc-accent-text";

  return (
    <span className={`rounded-[9px] px-2 py-0.5 text-[12px] font-semibold ${cls}`}>
      {type}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function VerifiedContentPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M04 · Bonus &amp; Community"
          title="Nội dung đã xác minh"
          actions={
            <>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink"
              >
                Xuất CSV
              </button>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-error bg-white px-[16px] text-[14px] font-semibold text-bvc-accent-text"
              >
                Gỡ xác minh đã chọn
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-hidden p-[22px_32px_26px]">
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Tổng cộng" value="128" />
            <StatCard label="Bản thu"   value="84"  />
            <StatCard label="Bản nhạc"  value="31"  />
            <StatCard label="Arrangement" value="13" />
          </div>

          {/* Table */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border">
            {/* Header row */}
            <div className="grid shrink-0 grid-cols-[2.4fr_1fr_1.2fr_0.6fr_0.7fr_0.9fr_1fr] items-center gap-[14px] bg-bvc-surface px-[18px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted" style={{ height: "46px" }}>
              <span>Tên nội dung</span>
              <span>Loại</span>
              <span>Người đóng góp</span>
              <span>Khóa</span>
              <span>Lần dùng</span>
              <span>Ngày xác minh</span>
              <span>Hành động</span>
            </div>

            {/* Data rows */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              {ROWS.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[2.4fr_1fr_1.2fr_0.6fr_0.7fr_0.9fr_1fr] items-center gap-[14px] border-b border-bvc-line px-[18px] last:border-0"
                  style={{ height: "52px" }}
                >
                  {/* Name with verified dot */}
                  <span className="flex items-center gap-[8px] text-[14px] font-semibold text-bvc-ink">
                    <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
                    <span className="truncate">{row.name}</span>
                  </span>

                  <TypeBadge type={row.type} />

                  <span className="text-[14px] text-bvc-muted">{row.contributor}</span>

                  <span className="text-[14px] text-bvc-muted">{row.key}</span>

                  <span className="font-mono text-[14px] text-bvc-ink">{row.uses}</span>

                  <span className="text-[14px] text-bvc-muted">{row.date}</span>

                  <button
                    type="button"
                    className="flex h-[34px] cursor-pointer items-center rounded-[10px] border border-bvc-border px-3 text-[13px] text-bvc-muted"
                  >
                    Gỡ xác minh
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
