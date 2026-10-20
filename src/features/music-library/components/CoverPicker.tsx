import { useEffect, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { FILE_RULES } from "@/features/music-library/constants/musicLibraryConstants";
import type { CoverTone } from "@/features/music-library/types/musicLibraryTypes";

interface CoverPickerProps {
  title: string;
  tone: CoverTone;
  currentUrl?: string;
  file: File | null;
  isRemoved: boolean;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export function CoverPicker({ title, tone, currentUrl, file, isRemoved, error, onSelect, onRemove }: CoverPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // URL xem trước tạo lúc chọn file (không tạo trong render để StrictMode không thu hồi nhầm)
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const previewRef = useRef(preview);

  useEffect(() => {
    previewRef.current = preview;
  });

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    },
    []
  );

  const pick = (picked: File) => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview({ file: picked, url: URL.createObjectURL(picked) });
    onSelect(picked);
  };

  const previewUrl = preview && preview.file === file ? preview.url : undefined;
  const shownUrl = previewUrl ?? (isRemoved ? undefined : currentUrl);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[13.5px] font-semibold text-bvc-ink">Ảnh bìa</span>
      <CoverArt title={title || "bài hát mới"} tone={tone} url={shownUrl} size="hero" className="w-40 lg:w-full" />
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={FILE_RULES.cover.accept}
          aria-label="Chọn ảnh bìa"
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) pick(picked);
            event.target.value = "";
          }}
        />
        <ActionButton variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageUp className="size-4" aria-hidden />
          {shownUrl ? "Thay ảnh" : "Chọn ảnh"}
        </ActionButton>
        {shownUrl && (
          <ActionButton variant="secondary" size="sm" onClick={onRemove}>
            Gỡ ảnh
          </ActionButton>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-[12.5px] font-medium text-bvc-error">
          {error}
        </p>
      ) : (
        <span className="text-xs leading-snug text-bvc-muted">
          JPG, PNG hoặc WebP, ảnh vuông. Giới hạn dung lượng theo cấu hình hệ thống. Không có ảnh thì dùng ảnh mặc định.
        </span>
      )}
    </div>
  );
}
