import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface SectionTitleProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

// Tiêu đề từng phần trong trang (dưới tiêu đề trang)
export function SectionTitle({ children, id, className }: SectionTitleProps) {
  return (
    <h2
      id={id}
      className={cn(
        "m-0 text-[18px] leading-snug font-semibold tracking-[-0.01em] text-bvc-ink md:text-[20px]",
        className
      )}
    >
      {children}
    </h2>
  );
}
