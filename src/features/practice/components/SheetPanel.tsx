import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus } from "lucide-react";
import { SheetCanvas } from "@/features/music-library/components/SheetCanvas";
import { SHEET_ZOOM } from "@/features/music-library/constants/musicLibraryConstants";
import { useSheetViewer } from "@/features/music-library/hooks/useSheetViewer";
import { StepperControl } from "@/shared/components/bvc/StepperControl";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { cn } from "@/shared/utils/cn";

interface SheetPanelProps {
  songId: string;
  sheetId: string;
}

// Khung xem bản nhạc ở cột trái màn luyện tập (từ lg), cao tối đa bằng chiều cao màn hình
export function SheetPanel({ songId, sheetId }: SheetPanelProps) {
  const { viewer, error, isLoading } = useSheetViewer(songId, sheetId);
  // null = vừa trang
  const [zoom, setZoom] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  // Điện thoại: mặc định thu gọn thành một dòng; từ lg luôn mở
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-label="Bản nhạc"
      className={cn(
        "mx-3.5 mt-2.5 flex min-h-0 flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-bvc-panel p-3 md:mx-0 md:mt-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:max-h-screen lg:p-4",
        open && "h-[75vh]"
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-bvc-ink lg:hidden"
      >
        <span>Bản nhạc{viewer ? ` · ${viewer.sheet.name}` : ""}</span>
        {open ? <ChevronUp className="size-4" aria-hidden /> : <ChevronDown className="size-4" aria-hidden />}
      </button>
      <div className={cn("min-h-0 flex-1 flex-col gap-3", open ? "flex" : "hidden lg:flex")}>
        {isLoading && <div aria-hidden className="flex-1 animate-pulse rounded-bvc-md bg-bvc-surface" />}
        {!isLoading && (error || !viewer) && (
          <p className="text-sm text-bvc-muted">{error ?? "Không mở được bản nhạc."}</p>
        )}
        {viewer && <SheetViewerBody viewer={viewer} zoom={zoom} setZoom={setZoom} page={page} setPage={setPage} />}
      </div>
    </section>
  );
}

type Viewer = NonNullable<ReturnType<typeof useSheetViewer>["viewer"]>;

interface BodyProps {
  viewer: Viewer;
  zoom: number | null;
  setZoom: (value: number | null) => void;
  page: number;
  setPage: (value: number) => void;
}

function SheetViewerBody({ viewer, zoom, setZoom, page, setPage }: BodyProps) {
  const { song, sheet } = viewer;
  const pageCount = sheet.sheetFile.pageCount;
  const currentPage = Math.min(page, pageCount);
  const zoomBase = zoom ?? SHEET_ZOOM.initial;

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-pressed={zoom === null}
          onClick={() => setZoom(null)}
          className={cn(
            actionButtonClass(zoom === null ? "soft" : "secondary", "sm"),
            "min-h-10 rounded-bvc-md border-bvc-border"
          )}
        >
          Vừa trang
        </button>
        <StepperControl
          value={zoom === null ? "Vừa" : `${zoom}%`}
          decrementLabel="Thu nhỏ"
          incrementLabel="Phóng to"
          decrementIcon={<Minus className="size-4" />}
          incrementIcon={<Plus className="size-4" />}
          onDecrement={() => setZoom(Math.max(SHEET_ZOOM.min, zoomBase - SHEET_ZOOM.step))}
          onIncrement={() => setZoom(Math.min(SHEET_ZOOM.max, zoomBase + SHEET_ZOOM.step))}
          canDecrement={zoomBase > SHEET_ZOOM.min}
          canIncrement={zoomBase < SHEET_ZOOM.max}
        />
        <StepperControl
          value={`${currentPage} / ${pageCount}`}
          decrementLabel="Trang trước"
          incrementLabel="Trang sau"
          decrementIcon={<ChevronLeft className="size-4" />}
          incrementIcon={<ChevronRight className="size-4" />}
          onDecrement={() => setPage(Math.max(1, currentPage - 1))}
          onIncrement={() => setPage(Math.min(pageCount, currentPage + 1))}
          canDecrement={currentPage > 1}
          canIncrement={currentPage < pageCount}
        />
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-auto rounded-bvc-xl bg-bvc-surface p-3",
          zoom === null ? "items-center justify-center" : "justify-center"
        )}
      >
        <SheetCanvas
          file={sheet.sheetFile}
          heading={`${song.title} - ${sheet.instrument.name.toLowerCase()}`}
          page={currentPage}
          zoom={zoom}
        />
      </div>
    </>
  );
}
