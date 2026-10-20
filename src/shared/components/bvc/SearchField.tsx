import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
  size?: "md" | "lg";
  className?: string;
}

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  maxLength = 100,
  size = "md",
  className,
}: SearchFieldProps) {
  const id = useId();

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border border-bvc-border-strong bg-white focus-within:border-bvc-ink",
        size === "lg" ? "rounded-2xl px-[18px]" : "rounded-[22px] px-3.5",
        className
      )}
    >
      <Search className="size-[18px] shrink-0 text-bvc-muted" strokeWidth={1.8} aria-hidden />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-w-0 flex-1 border-none bg-transparent text-bvc-ink outline-none placeholder:text-bvc-faint",
          "[&::-webkit-search-cancel-button]:hidden",
          size === "lg" ? "h-[54px] text-[15px]" : "h-11 text-sm"
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => onChange("")}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-muted hover:bg-bvc-surface"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
