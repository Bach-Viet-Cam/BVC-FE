import { FileMusic } from "lucide-react";
import type { SheetFile } from "@/features/music-library/types/musicLibraryTypes";

interface SheetCanvasProps {
  file: SheetFile;
  heading: string;
  page: number;
  zoom: number;
}

// PDF mở qua trình xem của trình duyệt, ảnh hiển thị theo % zoom
export function SheetCanvas({ file, heading, page, zoom }: SheetCanvasProps) {
  if (file.url && file.mimeType === "application/pdf") {
    return (
      <iframe
        key={`${page}-${zoom}`}
        title={heading}
        src={`${file.url}#page=${page}&zoom=${zoom}`}
        className="h-[70vh] w-full rounded-md border border-bvc-border-strong bg-white lg:h-full"
      />
    );
  }

  if (file.url) {
    return (
      <img
        src={file.url}
        alt={heading}
        className="h-auto max-w-none rounded-md border border-bvc-border-strong bg-white"
        style={{ width: `${zoom}%` }}
      />
    );
  }

  return (
    <div role="status" className="flex flex-col items-center justify-center gap-2 self-center text-center text-bvc-muted">
      <FileMusic className="size-8" strokeWidth={1.5} aria-hidden />
      <p className="text-sm">File bản nhạc chưa sẵn sàng, vui lòng quay lại sau.</p>
    </div>
  );
}
