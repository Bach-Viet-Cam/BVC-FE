import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";

interface SectionBadgeProps {
  children: ReactNode;
  className?: string;
}

const BADGE_CLASS =
  "inline-flex items-center gap-2 rounded-full border border-bvc-accent/15 bg-bvc-accent/5 px-4 py-1.5 text-[14px] font-medium whitespace-nowrap text-bvc-accent";

// Nhãn nhỏ phía trên tiêu đề mỗi phần, hiện dần khi cuộn tới (trang giới thiệu)
export function SectionBadge({ children, className }: SectionBadgeProps) {
  return (
    <motion.span
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(BADGE_CLASS, className)}
    >
      {children}
    </motion.span>
  );
}

interface EyebrowProps {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

// Nhãn ngữ cảnh phía trên tiêu đề các màn trong ứng dụng: một dòng chữ nhỏ, không khung, không biểu tượng.
// tone="dark" cho nền tối.
export function Eyebrow({ children, tone = "light", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "self-start text-[13px] font-medium",
        tone === "dark" ? "text-bvc-accent-border" : "text-bvc-accent",
        className
      )}
    >
      {children}
    </span>
  );
}

interface AccentProps {
  children: ReactNode;
}

// Cụm từ nhấn trong tiêu đề: nghiêng và nhạt màu
export function Accent({ children }: AccentProps) {
  return <em className="font-semibold text-bvc-ink/40 italic">{children}</em>;
}

interface SectionHeadingProps {
  id?: string;
  children: ReactNode;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({ id, children, align = "center", className }: SectionHeadingProps) {
  return (
    <motion.h2
      id={id}
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className={cn(
        "font-bvc-display text-[32px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-bvc-ink sm:text-[42px] lg:text-[52px]",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {children}
    </motion.h2>
  );
}
