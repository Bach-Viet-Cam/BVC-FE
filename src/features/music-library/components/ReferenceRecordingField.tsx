import { useRef } from "react";
import { AudioLines, Mic, Upload } from "lucide-react";
import { FileField } from "@/shared/components/bvc/FileField";
import { cn } from "@/shared/utils/cn";

interface ReferenceRecordingFieldProps {
  accept: string;
  fileName?: string;
  fileMeta?: string;
  hasError: boolean;
  /** Chỉ thu trực tiếp được khi thêm bản mới (trang thu quay về form tạo). */
  canRecord: boolean;
  onPick: (file: File) => void;
  onRecord: () => void;
}

interface ChoiceTileProps {
  title: string;
  hint: string;
  isPrimary?: boolean;
  hasError?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ChoiceTile({ title, hint, isPrimary, hasError, onClick, children }: ChoiceTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[54px] w-full cursor-pointer items-center gap-2.5 rounded-[13px] border py-[9px] pr-3 pl-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-accent",
        isPrimary
          ? "border-bvc-accent bg-bvc-accent text-white hover:bg-bvc-ink"
          : "border-bvc-border-strong bg-white text-bvc-ink hover:bg-bvc-surface",
        hasError && "border-bvc-error"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isPrimary ? "bg-white/15" : "bg-bvc-soft text-bvc-ink"
        )}
      >
        {children}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm leading-tight font-semibold">{title}</span>
        <span className={cn("text-[11.5px] leading-tight", isPrimary ? "text-white/80" : "text-bvc-muted")}>
          {hint}
        </span>
      </span>
    </button>
  );
}

// Ô "Bản thu mẫu": hai lối rõ ràng (thu trực tiếp hoặc tải file), thu trực tiếp nổi bật hơn; có file rồi thì chỉ hiện file đó.
export function ReferenceRecordingField({
  accept,
  fileName,
  fileMeta,
  hasError,
  canRecord,
  onPick,
  onRecord,
}: ReferenceRecordingFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      aria-label="Chọn bản thu mẫu"
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onPick(file);
        event.target.value = "";
      }}
    />
  );

  if (fileName || !canRecord) {
    return (
      <div className="flex flex-col gap-2">
        <FileField
          ariaLabel="Chọn bản thu mẫu"
          accept={accept}
          icon={<AudioLines className="size-4" strokeWidth={1.8} />}
          emptyLabel="Chọn file MP3, WAV, M4A"
          currentName={fileName}
          currentMeta={fileMeta}
          hasError={hasError}
          onSelect={onPick}
        />
        {canRecord && (
          <button
            type="button"
            onClick={onRecord}
            className="flex min-h-9 w-fit cursor-pointer items-center gap-2 rounded-full px-1 text-[13.5px] font-medium text-bvc-accent-text hover:underline"
          >
            <Mic size={16} aria-hidden />
            Thu lại trực tiếp
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <ChoiceTile title="Thu trực tiếp" hint="Vừa nghe các bè khác vừa thu" onClick={onRecord}>
        <Mic size={16} aria-hidden />
      </ChoiceTile>
      <ChoiceTile
        isPrimary
        title="Tải file lên"
        hint="MP3, WAV, M4A"
        hasError={hasError}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} aria-hidden />
      </ChoiceTile>
      {fileInput}
    </div>
  );
}
