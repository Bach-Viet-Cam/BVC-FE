import { useState } from "react";
import { DesktopSidebar, DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
  { label: "Duyệt nội dung", to: "/community/approval" },
  { label: "Quản lý bài nhạc", to: "/songs" },
  { label: "Cấu hình", to: "/admin/config" },
];

interface ContentItem {
  id: string;
  type: string;
  contributor: string;
  date: string;
  title: string;
  desc: string;
}

const ITEMS: ContentItem[] = [
  {
    id: "c1",
    type: "Arrangement",
    contributor: "Minh Anh",
    date: "24/09",
    title: "Lý ngựa ô — arrangement jazz phong cách hiện đại",
    desc: "Sắp xếp lại theo nhịp swing, thêm phần intro piano 8 bar.",
  },
  {
    id: "c2",
    type: "Bản thu",
    contributor: "Phương Linh",
    date: "23/09",
    title: "Trống cơm — recording bè đàn tranh nâng cao",
    desc: "Tempo 112 BPM, độ chính xác 94%, full 3 phút.",
  },
  {
    id: "c3",
    type: "Bản nhạc",
    contributor: "Quốc Bảo",
    date: "22/09",
    title: "Bèo dạt mây trôi — sheet simplified",
    desc: "Phiên bản đơn giản hóa cho người mới học, 2 trang A4.",
  },
  {
    id: "c4",
    type: "Arrangement",
    contributor: "Gia Hân",
    date: "21/09",
    title: "Hát ru — arrangement acoustic guitar + đàn tranh",
    desc: "Kết hợp ghi-ta và đàn tranh, key C, tempo 72.",
  },
  {
    id: "c5",
    type: "Bản thu",
    contributor: "Hoàng Tùng",
    date: "20/09",
    title: "Se chỉ luồn kim — recording học kỳ 2",
    desc: "Lần thu thứ 3, điểm AI: 88%.",
  },
];

function TypeBadge({ type }: { type: string }) {
  if (type === "Arrangement") {
    return (
      <span className="rounded-[9px] bg-bvc-accent-tint px-2 py-0.5 text-[12px] font-semibold text-bvc-accent-text">
        {type}
      </span>
    );
  }
  if (type === "Bản thu") {
    return (
      <span className="rounded-[9px] bg-bvc-surface px-2 py-0.5 text-[12px] font-semibold text-bvc-muted">
        {type}
      </span>
    );
  }
  return (
    <span className="rounded-[9px] border border-bvc-border px-2 py-0.5 text-[12px] font-semibold text-bvc-muted">
      {type}
    </span>
  );
}

export function ContentApprovalPage() {
  const [selectedId, setSelectedId] = useState("c1");

  const selected = ITEMS.find((it) => it.id === selectedId) ?? ITEMS[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M06 · Quản trị"
          title="Duyệt nội dung cộng đồng"
          actions={
            <>
              <select className="h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none">
                <option>Tất cả trạng thái</option>
                <option>Chờ duyệt</option>
                <option>Đã duyệt</option>
                <option>Từ chối</option>
              </select>
              <button
                type="button"
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border px-[18px] text-[14px] font-semibold"
                style={{
                  borderColor: "var(--color-bvc-error)",
                  color: "var(--color-bvc-accent-text)",
                }}
              >
                Từ chối đã chọn
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-hidden p-[22px_32px_26px]">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-[12px]">
            <StatCard label="Chờ duyệt" value="12" variant="accent" />
            <StatCard label="Đã duyệt tháng này" value="34" />
            <div className="flex flex-col gap-[5px] rounded-[18px] border border-bvc-border p-[15px_16px]">
              <span className="flex items-center gap-[7px] text-[12.5px] text-bvc-muted">
                <span
                  className="size-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--color-bvc-error)" }}
                />
                Từ chối
              </span>
              <span className="font-mono text-[29px] font-semibold leading-none text-bvc-ink">
                5
              </span>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-1 gap-[20px] overflow-hidden">
            {/* Left — item list */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              {ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`mb-3 w-full cursor-pointer rounded-[20px] border p-[14px] text-left ${
                    item.id === selectedId
                      ? "border-bvc-accent bg-bvc-accent-tint"
                      : "border-bvc-border bg-white hover:bg-bvc-surface"
                  }`}
                >
                  <div className="flex items-center gap-[10px]">
                    <TypeBadge type={item.type} />
                    <span className="text-[13px] font-bold text-bvc-ink">{item.contributor}</span>
                    <span className="ml-auto font-mono text-[12px] text-bvc-muted">{item.date}</span>
                  </div>
                  <div className="mt-[6px] text-[15px] font-bold text-bvc-ink">{item.title}</div>
                  <div className="mt-[4px] line-clamp-2 text-[13px] text-bvc-muted">{item.desc}</div>
                </button>
              ))}
            </div>

            {/* Right — detail panel */}
            <div className="flex w-[380px] shrink-0 flex-col gap-[14px] overflow-y-auto rounded-[20px] border border-bvc-border p-[20px]">
              {/* Title */}
              <div className="text-[16px] font-extrabold tracking-[-0.025em] text-bvc-ink">
                {selected.title}
              </div>

              {/* Preview */}
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                  Nội dung đính kèm
                </span>
                <div className="mt-[8px] flex h-[120px] items-center justify-center rounded-[14px] border border-bvc-border bg-bvc-surface text-[13px] text-bvc-muted">
                  Xem trước bản nhạc / bản thu
                </div>
              </div>

              {/* Info rows */}
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                  Thông tin
                </span>
                <div className="mt-[8px] flex flex-col">
                  <div className="flex h-[36px] items-center justify-between border-b border-bvc-line text-[13px]">
                    <span className="text-bvc-muted">Loại</span>
                    <TypeBadge type={selected.type} />
                  </div>
                  <div className="flex h-[36px] items-center justify-between border-b border-bvc-line text-[13px]">
                    <span className="text-bvc-muted">Đóng góp bởi</span>
                    <span className="font-semibold text-bvc-ink">{selected.contributor}</span>
                  </div>
                  <div className="flex h-[36px] items-center justify-between border-b border-bvc-line text-[13px]">
                    <span className="text-bvc-muted">Ngày nộp</span>
                    <span className="font-mono text-bvc-ink">{selected.date}/2026</span>
                  </div>
                  <div className="flex h-[36px] items-center justify-between text-[13px]">
                    <span className="text-bvc-muted">Lần dùng trước</span>
                    <span className="font-mono text-bvc-muted">—</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-[10px]">
                <textarea
                  placeholder="Lý do từ chối (tùy chọn)..."
                  className="min-h-[64px] w-full resize-none rounded-[12px] border border-bvc-border-strong bg-white p-3 text-[13px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
                />
                <div className="flex gap-[10px]">
                  <button
                    type="button"
                    className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-[13px] border border-bvc-border-strong px-5 text-[14px] font-semibold text-bvc-muted"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[13px] bg-bvc-ink px-5 text-[14px] font-bold text-white"
                  >
                    Duyệt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
