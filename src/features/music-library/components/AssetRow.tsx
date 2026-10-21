import { useRef, type ReactNode } from "react";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";
import { validateFile } from "@/features/music-library/utils/mediaUtils";

interface AssetRowProps {
  icon: ReactNode;
  // Có file: tên + thông tin phụ; chưa có: dòng chú thích
  fileName?: string;
  meta?: string;
  emptyText: string;
  emptyTone?: "muted" | "warn";
  rule: { accept: string; mimeTypes: readonly string[]; maxBytes: number };
  disabled?: boolean;
  onReplace: (file: File) => void;
}

export function AssetRow({
  icon,
  fileName,
  meta,
  emptyText,
  emptyTone = "muted",
  rule,
  disabled,
  onReplace,
}: AssetRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2">
      <span className="shrink-0 text-bvc-muted">{icon}</span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[12.5px]",
          fileName
            ? "font-bvc-mono text-bvc-ink"
            : emptyTone === "warn"
              ? "font-semibold text-bvc-accent-text"
              : "text-bvc-muted"
        )}
      >
        {fileName ? `${fileName}${meta ? ` · ${meta}` : ""}` : emptyText}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        aria-label={fileName ? `Thay ${fileName}` : emptyText}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const message = validateFile(file, rule);
          if (message) toast.error("File không hợp lệ", message);
          else onReplace(file);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="min-h-9 shrink-0 cursor-pointer rounded-[10px] border border-bvc-border-strong bg-white px-2.5 text-[12.5px] font-semibold text-bvc-ink hover:bg-bvc-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        {fileName ? "Thay file" : "Tải lên"}
      </button>
    </div>
  );
}
