import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const INSTRUMENTS = [
  { name: "Đàn tranh 16 dây", condition: "Tốt", price: "350.000₫", status: "Đang thuê", tenant: "Trần Minh Anh" },
  { name: "Đàn tranh 17 dây", condition: "Tốt", price: "420.000₫", status: "Đang thuê", tenant: "Lê Quốc Bảo" },
  { name: "Đàn bầu gỗ trắc", condition: "Khá tốt", price: "280.000₫", status: "Còn trống", tenant: "—" },
  { name: "Đàn nhị cao cấp", condition: "Tốt", price: "200.000₫", status: "Đang thuê", tenant: "Phạm Gia Hân" },
  { name: "Sáo trúc bạch dương", condition: "Mới", price: "120.000₫", status: "Còn trống", tenant: "—" },
  { name: "Đàn tỳ bà", condition: "Tốt", price: "380.000₫", status: "Đang thuê", tenant: "Nguyễn Gia Khánh" },
  { name: "Đàn tranh 19 dây", condition: "Khá tốt", price: "460.000₫", status: "Còn trống", tenant: "—" },
  { name: "Đàn bầu điện", condition: "Mới", price: "320.000₫", status: "Đang thuê", tenant: "Trần Bảo Châu" },
];

const REQUESTS = [
  { name: "Vũ Nhật Nam", instrument: "Đàn tranh 16 dây" },
  { name: "Đỗ Khánh Linh", instrument: "Đàn bầu gỗ trắc" },
  { name: "Nguyễn Phương Linh", instrument: "Sáo trúc bạch dương" },
];

const REVENUE_BARS = [45, 58, 62, 70, 80, 88];
const MONTHS = ["T4", "T5", "T6", "T7", "T8", "T9"];

export function RentalProviderPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <DesktopPageHeader
        breadcrumb="M06 · Cho thuê nhạc cụ"
        title="Quản lý cho thuê"
        actions={
          <>
            <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink">
              + Thêm nhạc cụ
            </button>
            <button type="button" className="min-h-[42px] cursor-pointer rounded-[14px] bg-bvc-ink px-[16px] text-[14px] font-bold text-white">
              Xem đơn hàng
            </button>
          </>
        }
      />

      <div className="flex flex-1 gap-[20px] overflow-hidden p-[20px_32px_24px]">
        {/* Left main */}
        <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Nhạc cụ cho thuê" value="8" />
            <StatCard label="Đang thuê" value="5" variant="ok" />
            <StatCard label="Yêu cầu mới" value="3" variant="surface" />
            <StatCard label="Doanh thu tháng" value="4.2M ₫" />
          </div>

          {/* Instrument table */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-bvc-border px-[18px] py-[15px]">
              <span className="text-[15px] font-bold">Danh sách nhạc cụ</span>
              <button type="button" className="min-h-[38px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13px]">
                + Thêm nhạc cụ
              </button>
            </div>
            <div className="grid shrink-0 grid-cols-[2fr_1fr_1fr_1.2fr_1.5fr_auto] gap-[14px] border-b border-bvc-border px-[18px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
              <span>Nhạc cụ</span>
              <span>Điều kiện</span>
              <span>Giá/tháng</span>
              <span>Tình trạng</span>
              <span>Người thuê</span>
              <span>Hành động</span>
            </div>
            {INSTRUMENTS.map((inst) => (
              <div
                key={inst.name}
                className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.5fr_auto] items-center gap-[14px] border-b border-bvc-border px-[18px] py-[13px] text-[14px] last:border-b-0"
              >
                <span className="font-semibold text-bvc-ink">{inst.name}</span>
                <span className="text-bvc-muted">{inst.condition}</span>
                <span className="font-bvc-mono text-bvc-ink">{inst.price}</span>
                <span className="flex items-center gap-[7px] text-[13.5px]">
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        inst.status === "Còn trống"
                          ? "var(--color-bvc-ok)"
                          : "var(--color-bvc-warn)",
                    }}
                  />
                  <span
                    style={{
                      color:
                        inst.status === "Còn trống"
                          ? "var(--color-bvc-ok)"
                          : "var(--color-bvc-warn)",
                    }}
                  >
                    {inst.status}
                  </span>
                </span>
                <span className="text-bvc-muted">{inst.tenant}</span>
                <div className="flex gap-[6px]">
                  <button
                    type="button"
                    className="min-h-[32px] cursor-pointer rounded-[10px] border border-bvc-border-strong bg-white px-[10px] text-[12px] font-semibold text-bvc-ink"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="min-h-[32px] cursor-pointer rounded-[10px] border border-bvc-border-strong bg-white px-[10px] text-[12px] font-semibold text-bvc-muted"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex w-[320px] shrink-0 flex-col gap-[14px]">
          {/* Requests card */}
          <div className="flex flex-col gap-[12px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
            <span className="text-[14px] font-bold">Yêu cầu thuê mới</span>
            <div className="flex flex-col gap-[8px]">
              {REQUESTS.map((req) => (
                <div key={req.name} className="flex items-center gap-[10px] rounded-[14px] bg-bvc-surface p-[11px]">
                  <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
                    <span className="text-[14px] font-semibold">{req.name}</span>
                    <span className="text-[12px] text-bvc-muted">{req.instrument}</span>
                  </div>
                  <button type="button" className="min-h-[34px] cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white px-[10px] text-[12.5px] font-semibold">
                    Duyệt
                  </button>
                  <button type="button" className="cursor-pointer text-[12.5px] text-bvc-muted">
                    Từ chối
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue chart */}
          <div className="flex flex-col gap-[12px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
            <span className="text-[14px] font-bold">Doanh thu 6 tháng</span>
            <div className="flex h-[90px] items-end gap-[8px]">
              {REVENUE_BARS.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-[4px]">
                  <span
                    className="w-full rounded-[4px]"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === REVENUE_BARS.length - 1
                        ? "var(--color-bvc-accent)"
                        : "var(--color-bvc-bar)",
                    }}
                  />
                  <span className="font-bvc-mono text-[10px] text-bvc-faint">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
