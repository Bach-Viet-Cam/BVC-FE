import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface PageTitleProps {
  children: ReactNode;
  // page: tiêu đề trang; bar: thanh tiêu đề có nút quay lại (gọn trên điện thoại, như tiêu đề trang trên web);
  // compact: thanh công cụ của màn luyện tập / bản nhạc
  size?: "page" | "bar" | "compact";
  tone?: "light" | "dark";
  className?: string;
  id?: string;
}

const SIZE_CLASSES = {
  page: "text-[26px] md:text-[30px]",
  bar: "truncate text-[18px] lg:text-[30px]",
  compact: "truncate text-[18px] md:text-[22px]",
};

// Một định dạng tiêu đề trang cho toàn ứng dụng: cùng font, độ đậm, giãn chữ; chỉ khác cỡ theo vị trí
export function PageTitle({ children, size = "page", tone = "light", className, id }: PageTitleProps) {
  return (
    <h1
      id={id}
      className={cn(
        "m-0 font-bvc-display leading-tight font-semibold tracking-[-0.02em] text-balance",
        SIZE_CLASSES[size],
        tone === "dark" ? "text-white" : "text-bvc-ink",
        className
      )}
    >
      {children}
    </h1>
  );
}
