import { FileMusic } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { SheetFile } from "@/features/music-library/types/musicLibraryTypes";

interface SheetCanvasProps {
  file: SheetFile;
  heading: string;
  page: number;
  // null = vừa trang: thấy trọn một trang trong khung
  zoom: number | null;
}

// PDF mở qua trình xem của trình duyệt, ảnh hiển thị theo % zoom
export function SheetCanvas({ file, heading, page, zoom }: SheetCanvasProps) {
  if (file.url && file.mimeType === "application/pdf") {
    // Chrome đọc view=Fit, Firefox (pdf.js) đọc zoom=page-fit
    const viewParams = zoom === null ? "view=Fit&zoom=page-fit" : `zoom=${zoom}`;
    return (
      <iframe
        key={`${page}-${zoom ?? "fit"}`}
        title={heading}
        src={`${file.url}#page=${page}&${viewParams}`}
        className="h-[70vh] w-full rounded-md border border-bvc-border-strong bg-white lg:h-full"
      />
    );
  }

  if (file.url) {
    return (
      <img
        src={file.url}
        alt={heading}
        className={cn(
          "rounded-md border border-bvc-border-strong bg-white",
          zoom === null ? "h-auto max-h-full w-auto max-w-full self-center object-contain" : "h-auto max-w-none"
        )}
        style={zoom === null ? undefined : { width: `${zoom}%` }}
      />
    );
  }

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-2 self-center text-center text-bvc-muted"
    >
      <FileMusic className="size-8" strokeWidth={1.5} aria-hidden />
      <p className="text-sm">File bản nhạc chưa sẵn sàng, vui lòng quay lại sau.</p>
    </div>
  );
}
