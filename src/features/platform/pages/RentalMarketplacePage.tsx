import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileHeader } from "@/shared/components/bvc";

interface InstrumentItem {
  name: string;
  provider: string;
  price: string;
  deposit: string;
  area: string;
  distance: string;
  available: boolean;
  status: "ok" | "warn";
}

const INSTRUMENTS: InstrumentItem[] = [
  {
    name: "Đàn tranh 16 dây",
    provider: "Nhạc cụ Minh Long",
    price: "800.000",
    deposit: "2.000.000",
    area: "Quận 9",
    distance: "1.2 km",
    available: true,
    status: "ok",
  },
  {
    name: "Đàn bầu cổ",
    provider: "Đức Anh Music",
    price: "600.000",
    deposit: "1.500.000",
    area: "Thủ Đức",
    distance: "3.8 km",
    available: true,
    status: "ok",
  },
  {
    name: "Sáo trúc G-key",
    provider: "Nhạc cụ Phương Nam",
    price: "300.000",
    deposit: "800.000",
    area: "Bình Thạnh",
    distance: "5.1 km",
    available: false,
    status: "warn",
  },
  {
    name: "Tỳ bà 4 dây",
    provider: "Nhạc cụ Minh Long",
    price: "1.200.000",
    deposit: "3.000.000",
    area: "Quận 9",
    distance: "1.2 km",
    available: true,
    status: "ok",
  },
  {
    name: "Đàn nhị truyền thống",
    provider: "Nghệ Nhân Hùng",
    price: "500.000",
    deposit: "1.200.000",
    area: "Quận 1",
    distance: "8.4 km",
    available: true,
    status: "ok",
  },
  {
    name: "Đàn tranh 17 dây cao cấp",
    provider: "Đức Anh Music",
    price: "1.500.000",
    deposit: "5.000.000",
    area: "Thủ Đức",
    distance: "3.8 km",
    available: true,
    status: "ok",
  },
];

const INSTRUMENT_FILTERS = ["Tất cả", "Đàn tranh", "Đàn bầu", "Đàn nhị", "Tỳ bà", "Sáo trúc"];
const AREA_FILTERS = ["Tất cả khu vực", "Quận 9", "Thủ Đức", "Bình Thạnh", "Quận 1"];

export function RentalMarketplacePage() {
  const navigate = useNavigate();
  const [activeInstrument, setActiveInstrument] = useState("Tất cả");
  const [activeArea, setActiveArea] = useState("Tất cả khu vực");

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Thuê nhạc cụ" />

        {/* Filter row — instrument */}
        <div className="px-[14px] pt-3 pb-2">
          <div
            className="overflow-x-auto flex gap-2 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {INSTRUMENT_FILTERS.map((f) => {
              const isActive = activeInstrument === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveInstrument(f)}
                  className={`shrink-0 rounded-[11px] px-3 py-1.5 text-[13px] border ${
                    isActive
                      ? "border-bvc-ink bg-bvc-ink text-white font-bold"
                      : "border-bvc-border-strong text-bvc-muted bg-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Area filter */}
          <div
            className="overflow-x-auto flex gap-2 pb-1 mt-2"
            style={{ scrollbarWidth: "none" }}
          >
            {AREA_FILTERS.map((f) => {
              const isActive = activeArea === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveArea(f)}
                  className={`shrink-0 rounded-[11px] px-3 py-1.5 text-[13px] border ${
                    isActive
                      ? "border-bvc-ink bg-bvc-ink text-white font-bold"
                      : "border-bvc-border-strong text-bvc-muted bg-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Item count */}
        <div className="text-[12px] text-bvc-muted px-[14px] pb-2">
          8 nhạc cụ phù hợp
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="pb-5">
            {INSTRUMENTS.map((item) => (
              <div
                key={item.name}
                onClick={() => navigate("/rental")}
                className={`mx-[14px] mb-3 rounded-[20px] border border-bvc-border p-[14px] cursor-pointer ${
                  !item.available ? "opacity-60" : ""
                }`}
              >
                {/* Row 1: name + availability badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-bold text-bvc-ink truncate flex-1">
                    {item.name}
                  </span>
                  <span
                    className={`text-[12px] font-semibold rounded-[9px] px-2 py-0.5 flex items-center gap-1 shrink-0 ${
                      item.available
                        ? "text-bvc-ink"
                        : "text-bvc-ink"
                    }`}
                  >
                    <span
                      className="size-[7px] rounded-full shrink-0"
                      style={{
                        backgroundColor: item.status === "ok"
                          ? "var(--color-bvc-ok)"
                          : "var(--color-bvc-warn)",
                      }}
                    />
                    {item.available ? "Còn trống" : "Đã cho thuê"}
                  </span>
                </div>

                {/* Row 2: provider */}
                <div className="text-[12px] text-bvc-muted mt-[3px]">
                  {item.provider}
                </div>

                {/* Row 3: price + distance */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-[15px] text-bvc-ink">
                      {item.price}
                    </span>
                    <span className="text-[12px] text-bvc-muted">₫/tháng</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-mono text-bvc-muted">{item.distance}</span>
                    <span className="text-[12px] text-bvc-muted">· {item.area}</span>
                  </div>
                </div>

                {/* Row 4: deposit */}
                <div className="text-[12px] text-bvc-muted mt-1">
                  Cọc: {item.deposit}₫
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
