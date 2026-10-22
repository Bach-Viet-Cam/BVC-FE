import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function visiblePages(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1 ? ["gap" as const, value] : [value]
  );
}

const squareClass =
  "flex size-10 cursor-pointer items-center justify-center rounded-xl border border-bvc-border bg-white text-bvc-ink disabled:cursor-not-allowed disabled:text-bvc-faint";

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Phân trang" className={cn("flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={squareClass}
      >
        <ChevronLeft className="size-4" />
      </button>
      {visiblePages(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-bvc-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              "flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl px-2 font-bvc-mono text-[13px]",
              item === page
                ? "bg-bvc-ink text-white"
                : "border border-bvc-border bg-white text-bvc-ink hover:bg-bvc-surface"
            )}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={squareClass}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
