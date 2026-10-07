import { Pencil, Trash2 } from "lucide-react";
import { DesktopSidebar, DesktopPageHeader } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Cấu hình hệ thống", to: "/admin/config" },
  { label: "Phân loại nội dung", to: "/admin/categories" },
  { label: "Giám sát hệ thống", to: "/admin/monitoring" },
  { label: "Quản lý thông báo", to: "/admin/notifications" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
];

interface ContentCategory {
  cat: string;
  count: number;
  items: string[];
}

const CONTENT_CATEGORIES: ContentCategory[] = [
  { cat: "Dân ca", count: 24, items: ["Dân ca Nam Bộ", "Dân ca Bắc Bộ", "Quan họ", "Dân ca miền Trung"] },
  { cat: "Nhạc lễ", count: 8, items: ["Nhạc lễ Huế", "Đờn ca tài tử"] },
  { cat: "Nhạc cổ điển", count: 6, items: ["Độc tấu", "Hòa tấu nhỏ"] },
  { cat: "Cộng đồng", count: 15, items: ["Arrangement", "Cover", "Sáng tác mới"] },
];

const INSTRUMENTS = ["Đàn bầu", "Đàn nhị", "Đàn nguyệt", "Đàn tranh", "Tỳ bà", "Sáo trúc"];

export function CategoriesAdminPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "AD", name: "Admin BVC", role: "Quản trị viên" }}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M06 · Quản trị"
          title="Phân loại nội dung"
          actions={
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Thêm danh mục
            </button>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <div className="grid grid-cols-2 gap-[20px]">

            {/* Left: Danh mục nội dung */}
            <div className="flex flex-col gap-[4px] rounded-[20px] border border-bvc-border p-[18px]">
              <div className="mb-[8px] flex items-center justify-between">
                <span className="text-[15px] font-extrabold tracking-[-0.025em]">Danh mục nội dung</span>
              </div>
              {CONTENT_CATEGORIES.map((category) => (
                <div key={category.cat} className="mb-2 rounded-[14px] border border-bvc-line p-[12px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="font-bold text-[14px] text-bvc-ink">{category.cat}</span>
                    <span className="rounded-[8px] bg-bvc-surface px-2 font-mono text-[12px] text-bvc-muted">
                      {category.count}
                    </span>
                    <Pencil size={14} className="ml-auto cursor-pointer text-bvc-muted" />
                    <Trash2 size={14} className="ml-1 cursor-pointer text-bvc-muted" />
                  </div>
                  <div className="mt-2 flex flex-col gap-1 border-l-2 border-bvc-border pl-3">
                    {category.items.map((item) => (
                      <div
                        key={item}
                        className="flex h-[36px] items-center justify-between text-[13px] text-bvc-ink"
                      >
                        <span>{item}</span>
                        <span className="flex items-center gap-[8px]">
                          <Pencil size={13} className="cursor-pointer text-bvc-muted" />
                          <Trash2 size={13} className="cursor-pointer text-bvc-muted" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Danh mục nhạc cụ (Admin only) */}
            <div className="rounded-[20px] border-2 border-bvc-accent bg-bvc-accent-tint p-[18px]">
              <div className="mb-[12px] flex items-center gap-[10px]">
                <span className="text-[15px] font-extrabold tracking-[-0.025em] text-bvc-ink">Nhạc cụ</span>
                <span className="rounded-[9px] bg-bvc-accent px-2 py-0.5 text-[11px] font-bold text-white">
                  Chỉ Admin
                </span>
              </div>
              <div className="flex flex-col">
                {INSTRUMENTS.map((name) => (
                  <div
                    key={name}
                    className="flex h-[46px] items-center border-b border-bvc-line text-[14px] text-bvc-ink last:border-0"
                  >
                    <span className="flex-1">{name}</span>
                    <span className="rounded-[8px] border border-bvc-border px-2 text-[11px] text-bvc-muted">
                      Preset Tuner
                    </span>
                    <Pencil size={14} className="ml-3 cursor-pointer text-bvc-muted" />
                    <Trash2 size={14} className="ml-2 cursor-pointer text-bvc-muted" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
