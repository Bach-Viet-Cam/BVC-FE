import { useState } from "react";
import {
  MobileHeader,
  FilterChips,
  StatusDot,
} from "@/shared/components/bvc";

interface RentalItem {
  id: string;
  name: string;
  price: string;
  provider: string;
  description: string;
  tags: string[];
  status: "ok" | "warn";
  statusLabel: string;
}

const RENTAL_ITEMS: RentalItem[] = [
  {
    id: "1",
    name: "Đàn tranh 16 dây",
    price: "350.000₫/tháng",
    provider: "Nhạc cụ Thăng Long",
    description: "Đàn tranh 16 dây · Gỗ hương · Đã được kiểm định",
    tags: ["bảo hành", "giao hàng"],
    status: "ok",
    statusLabel: "Còn hàng",
  },
  {
    id: "2",
    name: "Đàn tranh 17 dây",
    price: "420.000₫/tháng",
    provider: "Âm nhạc Phương Nam",
    description: "Đàn tranh 17 dây · Gỗ hương · Đã được kiểm định",
    tags: ["dạy kèm"],
    status: "ok",
    statusLabel: "Còn hàng",
  },
  {
    id: "3",
    name: "Đàn bầu gỗ trắc",
    price: "280.000₫/tháng",
    provider: "Nhạc cụ Hà Nội",
    description: "Đàn bầu gỗ trắc · Truyền thống · Đã được kiểm định",
    tags: ["truyền thống"],
    status: "ok",
    statusLabel: "Còn hàng",
  },
  {
    id: "4",
    name: "Đàn nhị cao cấp",
    price: "200.000₫/tháng",
    provider: "Cô Ngọc Lan",
    description: "Đàn nhị cao cấp · Gỗ gụ · Dây kim loại",
    tags: ["đặt cọc"],
    status: "warn",
    statusLabel: "Đặt trước",
  },
];

const FILTER_CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "dan-tranh", label: "Đàn tranh" },
  { value: "dan-bau", label: "Đàn bầu" },
  { value: "dan-nhi", label: "Đàn nhị" },
];

export function RentalPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Thuê nhạc cụ" variant="back" />

        <FilterChips
          chips={FILTER_CHIPS}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {/* Scrollable list */}
        <div
          className="mt-3 flex-1 space-y-3 overflow-y-auto px-[14px] pb-5"
          style={{ scrollbarWidth: "none" }}
        >
          {RENTAL_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-bvc-border p-[14px]"
            >
              {/* Row 1: name + price */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[16px] font-bold text-bvc-ink">
                  {item.name}
                </span>
                <span className="font-bvc-mono shrink-0 text-[14px] text-bvc-accent-text">
                  {item.price}
                </span>
              </div>

              {/* Row 2: provider + status */}
              <div className="mt-[6px] flex items-center justify-between">
                <span className="text-[13px] text-bvc-muted">{item.provider}</span>
                <StatusDot status={item.status} label={item.statusLabel} size={7} />
              </div>

              {/* Row 3: description */}
              <p className="mt-[5px] text-[12px] text-bvc-faint">{item.description}</p>

              {/* Row 4: tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-bvc-surface px-2 py-1 text-[12px] text-bvc-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA button */}
              <button
                type="button"
                className="mt-2 h-[40px] w-full cursor-pointer rounded-[14px] border border-bvc-border-strong text-[14px] font-semibold text-bvc-ink"
              >
                Liên hệ thuê
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
