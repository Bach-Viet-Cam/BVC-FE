// Kiểu bảng dùng chung cho mọi màn (bảng xếp hạng, lịch sử bài nộp, quản trị...).
// Tiêu đề cột viết thường, cỡ nhỏ, màu nhạt, không xuống dòng; hàng ngăn bằng đường kẻ mảnh, rê chuột thì nền sáng nhẹ.
const HEAD_TEXT = "text-[13px] font-medium whitespace-nowrap text-bvc-muted";

export const TABLE_STYLES = {
  frame: "overflow-x-auto rounded-bvc-xl border border-bvc-border bg-white",
  table: "w-full border-collapse text-left text-[14px] text-bvc-ink",
  // Bảng nhiều cột (quản trị): chữ nhỏ hơn một chút để vừa màn laptop
  dense: "text-[13px]",
  headRow: "border-b border-bvc-border bg-bvc-soft",
  // Dùng khi kiểu chữ tiêu đề đặt ở hàng <tr> thay vì từng ô
  headText: HEAD_TEXT,
  headCell: `px-4 py-3 ${HEAD_TEXT}`,
  row: "border-b border-bvc-border transition-colors last:border-b-0 hover:bg-bvc-soft/70",
  cell: "px-4 py-3.5 align-middle",
} as const;
