import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { StepperControl } from "@/shared/components/bvc/StepperControl";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { cn } from "@/shared/utils/cn";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { GuestSaveDialog } from "@/features/music-library/components/GuestSaveDialog";
import { ReferencePlayer } from "@/features/music-library/components/ReferencePlayer";
import { SaveToggleButton } from "@/features/music-library/components/SaveToggleButton";
import { SheetCanvas } from "@/features/music-library/components/SheetCanvas";
import { SpeedSelector } from "@/features/music-library/components/SpeedSelector";
import { TutorialVideoCard } from "@/features/music-library/components/TutorialVideoCard";
import { SHEET_ZOOM } from "@/features/music-library/constants/musicLibraryConstants";
import { useSaveToggle } from "@/features/music-library/hooks/useSaveToggle";
import { useSheetViewer } from "@/features/music-library/hooks/useSheetViewer";

type SidePanel = "recording" | "video";

export function SheetPage() {
  const { songId = "", sheetId = "" } = useParams();
  const { viewer, error, isLoading, setSheetSaved } = useSheetViewer(songId, sheetId);
  const save = useSaveToggle();
  const [zoom, setZoom] = useState<number>(SHEET_ZOOM.initial);
  const [page, setPage] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [panel, setPanel] = useState<SidePanel>("recording");

  if (isLoading) {
    return (
      <StudentShell>
        <div aria-hidden className="m-[18px] flex-1 animate-pulse rounded-bvc-xl bg-bvc-surface md:mx-14 md:my-6" />
      </StudentShell>
    );
  }

  if (error || !viewer) {
    return (
      <StudentShell>
        <div className="px-[18px] py-10 md:px-14">
          <EmptyState
            title="Không mở được bản nhạc"
            description={error}
            actions={
              <Link to={`/library/${songId}`} className={actionButtonClass("primary", "md", "hover:text-white")}>
                Về trang bài hát
              </Link>
            }
          />
        </div>
      </StudentShell>
    );
  }

  const { song, sheet, fallbackRecording } = viewer;
  const recording = sheet.referenceRecording ?? fallbackRecording;
  const pageCount = sheet.sheetFile.pageCount;
  const currentPage = Math.min(page, pageCount);

  return (
    <StudentShell className="lg:flex-row lg:overflow-hidden">
      <section
        aria-label="Bản nhạc"
        className="flex min-w-0 flex-1 flex-col gap-3.5 px-[18px] pt-4 pb-4 md:px-8 md:pl-14 lg:pb-6"
      >
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            to={`/library/${song.id}`}
            aria-label="Quay lại bài hát"
            className="flex size-11 shrink-0 items-center justify-center rounded-bvc-md border border-bvc-border text-bvc-ink hover:bg-bvc-surface hover:text-bvc-ink"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <CoverArt
            title={song.title}
            tone={song.coverTone}
            url={song.coverUrl}
            size="thumb"
            className="hidden sm:flex"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="truncate text-lg font-extrabold tracking-[-0.02em] text-bvc-ink md:text-[22px]">
              {sheet.name}
            </h1>
            <span className="truncate text-[13px] text-bvc-muted">
              {song.title} · {sheet.instrument.name} · {sheet.level.name}
              {sheet.isMain && " · bản của giảng viên"}
            </span>
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
            <StepperControl
              value={`${zoom}%`}
              decrementLabel="Thu nhỏ"
              incrementLabel="Phóng to"
              decrementIcon={<Minus className="size-4" />}
              incrementIcon={<Plus className="size-4" />}
              onDecrement={() => setZoom((value) => Math.max(SHEET_ZOOM.min, value - SHEET_ZOOM.step))}
              onIncrement={() => setZoom((value) => Math.min(SHEET_ZOOM.max, value + SHEET_ZOOM.step))}
              canDecrement={zoom > SHEET_ZOOM.min}
              canIncrement={zoom < SHEET_ZOOM.max}
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
        </div>

        <div className="flex min-h-[420px] flex-1 justify-center overflow-auto rounded-bvc-xl bg-bvc-surface p-3 md:p-6">
          <SheetCanvas
            file={sheet.sheetFile}
            heading={`${song.title} — ${sheet.instrument.name.toLowerCase()}`}
            page={currentPage}
            zoom={zoom}
          />
        </div>
      </section>

      <aside className="flex shrink-0 flex-col gap-[18px] border-bvc-border px-[18px] pb-6 lg:w-[420px] lg:overflow-y-auto lg:border-l lg:px-7 lg:pt-5">
        {save.canSave && (
          <SaveToggleButton
            itemName={sheet.name}
            isSaved={save.isSavedForViewer(sheet.isSaved)}
            savedLabel="Đã lưu bản này"
            unsavedLabel="Lưu bản này"
            disabled={save.isPending(sheet.id)}
            onToggle={() =>
              save.toggle({ target: "sheet", id: sheet.id, isSaved: sheet.isSaved, onChange: setSheetSaved })
            }
          />
        )}

        <PillTabs<SidePanel>
          label="Nội dung kèm bản nhạc"
          value={panel}
          onChange={setPanel}
          tabs={[
            { value: "recording", label: "Bản mẫu" },
            { value: "video", label: "Video hướng dẫn" },
          ]}
          className="lg:hidden"
        />

        <div className={cn(panel !== "video" && "hidden", "lg:block")}>
          <TutorialVideoCard video={sheet.tutorialVideo} />
        </div>

        <div className={cn("flex flex-col gap-3", panel !== "recording" && "hidden", "lg:flex")}>
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-bold text-bvc-ink">Bản thu mẫu · {sheet.instrument.name}</span>
          </div>
          {recording ? (
            <>
              <ReferencePlayer
                key={recording.name}
                recording={recording}
                title={sheet.referenceRecording ? "Bản thu mẫu" : "Bản thu của bản chính"}
                subtitle={sheet.referenceRecording ? undefined : "Bản này dùng bản thu của bản chính"}
                rate={speed}
                barCount={32}
                className="border border-bvc-border"
              />
              <SpeedSelector value={speed} onChange={setSpeed} />
            </>
          ) : (
            <p className="rounded-2xl bg-bvc-surface px-4 py-6 text-center text-[13px] text-bvc-muted">
              Bản này chưa có bản thu mẫu.
            </p>
          )}
        </div>

        {viewer.practice.isAvailable ? (
          <Link
            to={`/practice/${song.id}?sheetId=${sheet.id}`}
            className={actionButtonClass("primary", "lg", "mt-auto w-full hover:text-white")}
          >
            Luyện bản này
          </Link>
        ) : (
          <p className="mt-auto rounded-2xl bg-bvc-surface px-4 py-3 text-center text-[13px] text-bvc-muted">
            {viewer.practice.reason}
          </p>
        )}
      </aside>

      <GuestSaveDialog open={save.isGuestPromptOpen} onOpenChange={save.setGuestPromptOpen} />
    </StudentShell>
  );
}
