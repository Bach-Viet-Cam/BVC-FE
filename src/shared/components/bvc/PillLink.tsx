import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface PillLinkProps {
  to: string;
  label: string;
  variant?: "dark" | "light" | "glass";
  size?: "md" | "lg";
  // Truyền qua router (vd. trang đăng nhập dùng state.from để quay lại đúng trang)
  state?: unknown;
  className?: string;
}

const VARIANTS = {
  dark: { pill: "bg-bvc-ink text-white hover:text-white", dot: "bg-white text-bvc-ink" },
  light: { pill: "bg-white text-bvc-ink hover:text-bvc-ink", dot: "bg-bvc-ink text-white" },
  glass: {
    pill: "border border-white/50 bg-white/15 text-white backdrop-blur-md hover:text-white",
    dot: "bg-white text-bvc-ink",
  },
} as const;

// Nút dạng viên thuốc: rê chuột thì vòng mũi tên trượt sang trái, chữ sang phải
export function PillLink({ to, label, variant = "dark", size = "lg", state, className }: PillLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = VARIANTS[variant];

  return (
    <Link
      to={to}
      state={state}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={cn(
        "inline-flex shrink-0 items-center gap-3 rounded-full font-medium whitespace-nowrap transition-[padding] duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-accent",
        size === "lg" ? "h-14 text-[16px] md:text-[17px]" : "h-11 text-[15px]",
        isHovered ? "flex-row-reverse pr-5 pl-2" : "flex-row pr-2 pl-5",
        styles.pill,
        className
      )}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 400, damping: 32 }} className="min-w-0 truncate">
        {label}
      </motion.span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          size === "lg" ? "size-10" : "size-8",
          styles.dot
        )}
      >
        <ArrowUpRight className="size-4" strokeWidth={2.4} aria-hidden />
      </motion.span>
    </Link>
  );
}
