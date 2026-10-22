import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface FileFieldProps {
  accept: string;
  currentName?: string;
  currentMeta?: string;
  emptyLabel: string;
  icon?: ReactNode;
  onSelect: (file: File) => void;
  hasError?: boolean;
  disabled?: boolean;
  ariaLabel: string;
}

// Hiện file đang có (tên + dung lượng/thời lượng) và nút Chọn / Thay file; input file thật bị ẩn
export function FileField({
  accept,
  currentName,
  currentMeta,
  emptyLabel,
  icon,
  onSelect,
  hasError,
  disabled,
  ariaLabel,
}: FileFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-[13px] border py-[9px] pr-2.5 pl-3",
        hasError ? "border-bvc-error" : "border-bvc-border-strong",
        !currentName && "border-dashed"
      )}
    >
      {icon && <span className="shrink-0 text-bvc-muted">{icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-[12.5px]",
            currentName ? "font-bvc-mono text-bvc-ink" : "text-sm font-semibold text-bvc-ink"
          )}
        >
          {currentName ?? emptyLabel}
        </span>
        {currentMeta && <span className="font-bvc-mono text-[11.5px] text-bvc-muted">{currentMeta}</span>}
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        aria-label={ariaLabel}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="min-h-9 shrink-0 cursor-pointer rounded-[10px] border border-bvc-border-strong bg-white px-2.5 text-[12.5px] font-semibold text-bvc-ink hover:bg-bvc-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        {currentName ? "Thay file" : "Chọn file"}
      </button>
    </div>
  );
}
