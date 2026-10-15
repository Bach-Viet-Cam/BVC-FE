import type { SheetFile } from "@/features/music-library/types/musicLibraryTypes";

interface SheetCanvasProps {
  file: SheetFile;
  heading: string;
  meta: string;
  page: number;
  zoom: number;
}

const PAGE_WIDTH = 600;
const STAFF_GROUPS = 6;

// File thật: PDF qua trình xem của trình duyệt, ảnh hiển thị theo % zoom.
// Dữ liệu mock chưa có file thì vẽ trang khuông nhạc giữ chỗ.
export function SheetCanvas({ file, heading, meta, page, zoom }: SheetCanvasProps) {
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
    <div
      role="img"
      aria-label={`${heading}, trang ${page} (ảnh tạm)`}
      className="flex shrink-0 flex-col gap-8 rounded-md border border-bvc-border-strong bg-white px-[7%] py-[6%]"
      style={{ width: (PAGE_WIDTH * zoom) / 100, maxWidth: zoom <= 100 ? "100%" : undefined }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-bvc-ink" style={{ fontSize: Math.max(12, (17 * zoom) / 100) }}>
          {heading}
        </span>
        <span className="font-bvc-mono text-[12.5px] whitespace-nowrap text-bvc-muted">
          {meta} · trang {page}
        </span>
      </div>
      {Array.from({ length: STAFF_GROUPS }, (_, group) => (
        <div key={group} className="flex flex-col" style={{ gap: (12 * zoom) / 100 }}>
          {Array.from({ length: 5 }, (_, line) => (
            <span key={line} className="h-px bg-bvc-bar" />
          ))}
        </div>
      ))}
    </div>
  );
}
