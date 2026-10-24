import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { FocusHeader } from "@/shared/components/bvc/FocusHeader";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { cn } from "@/shared/utils/cn";
import { InstrumentSheetGroup } from "@/features/music-library/components/InstrumentSheetGroup";
import { SheetFormPanel } from "@/features/music-library/components/SheetFormPanel";
import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { useSongSheets } from "@/features/music-library/hooks/useSongSheets";
import { useVisibilityConfirm } from "@/features/music-library/hooks/useVisibilityConfirm";
import type { LecturerSheetMusic } from "@/features/music-library/types/lecturerTypes";
import { sheetViewerHref } from "@/features/music-library/utils/sheetUtils";
import type { SheetFormValues } from "@/features/music-library/utils/validateSheet";

type PanelState = { mode: "create"; instrumentId?: string } | { mode: "edit"; sheet: LecturerSheetMusic } | null;

export function SheetManagePage() {
  const { songId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { options } = useMusicCategories("lecturer");
  const data = useSongSheets(songId);
  const visibility = useVisibilityConfirm(data.changeVisibility);
  // Mở sẵn form khi đi từ nút "Tạo bản nhạc" ở trang chi tiết bài hát (?new=1&instrument=...)
  const [panel, setPanel] = useState<PanelState>(() =>
    params.get("new") ? { mode: "create", instrumentId: params.get("instrument") ?? undefined } : null
  );

  const closePanel = () => {
    setPanel(null);
    if (params.has("new")) setParams({}, { replace: true });
  };

  const submitSheet = async (values: SheetFormValues, editing?: LecturerSheetMusic) => {
    const failure = await data.saveSheet(values, editing);
    if (!failure) closePanel();
    return failure;
  };

  const { song, sheets, groups } = data;
  const pendingSheet = visibility.pending?.item;
  // Trang xem của thư viện chỉ mở được nội dung đang công khai
  const isSongViewable = song?.effectiveVisibility === "PUBLIC";
  const previewHrefOf = (sheet: LecturerSheetMusic) =>
    song && isSongViewable && sheet.effectiveVisibility === "PUBLIC" ? sheetViewerHref(song.id, sheet.id) : undefined;

  return (
    <TeacherShell className="lg:flex-row lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <FocusHeader
          backTo={song && !song.canEdit ? `/library/${song.id}` : "/songs"}
          backLabel={song && !song.canEdit ? "Quay lại trang bài hát" : "Quay lại thư viện bài hát của tôi"}
          title={song ? `Bản nhạc - ${song.title}` : "Bản nhạc"}
          subtitle={
            song &&
            `${sheets.length} bản · ${groups.length} nhạc cụ · mỗi nhạc cụ 1 bản chính`
          }
          actions={
            <>
              {song && isSongViewable && (
                <Link to={`/library/${song.id}`} className={actionButtonClass("secondary", "md", "hover:text-bvc-ink")}>
                  Xem như sinh viên
                </Link>
              )}
              <ActionButton onClick={() => setPanel({ mode: "create" })} disabled={!song}>
                <Plus className="size-[18px]" aria-hidden />
                Thêm bản nhạc
              </ActionButton>
            </>
          }
        />

        <div className={cn("flex flex-col gap-7 px-[18px] py-6 md:px-8", data.isRefreshing && "opacity-70")}>
          {data.error ? (
            <EmptyState
              title="Không tải được bản nhạc"
              description={data.error}
              actions={<ActionButton onClick={data.reload}>Thử lại</ActionButton>}
            />
          ) : data.isFirstLoad ? (
            <div aria-hidden className="flex animate-pulse flex-col gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <span key={index} className="h-44 rounded-[18px] bg-bvc-surface" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              title="Bài hát chưa có bản nhạc"
              description="Nhạc cụ của bài hát được lấy từ các bản nhạc. Thêm bản nhạc đầu tiên và chọn nhạc cụ cho bản đó."
              actions={<ActionButton onClick={() => setPanel({ mode: "create" })}>Thêm bản nhạc</ActionButton>}
            />
          ) : (
            groups.map((group) => (
              <InstrumentSheetGroup
                key={group.instrument.id}
                instrument={group.instrument}
                sheets={group.sheets}
                selectedSheetId={panel?.mode === "edit" ? panel.sheet.id : undefined}
                busySheetId={data.busySheetId}
                previewHrefOf={previewHrefOf}
                onAdd={(instrumentId) => setPanel({ mode: "create", instrumentId })}
                onEdit={(sheet) => setPanel({ mode: "edit", sheet })}
                onReplaceFile={data.replaceFile}
                onRequestVisibility={(sheet, nextVisible) =>
                  visibility.request(sheet, nextVisible ? "PUBLIC" : "HIDDEN")
                }
              />
            ))
          )}
        </div>
      </div>

      {panel && song && (
        <SheetFormPanel
          key={panel.mode === "edit" ? panel.sheet.id : `new-${panel.instrumentId ?? ""}`}
          song={song}
          sheets={sheets}
          editing={panel.mode === "edit" ? panel.sheet : undefined}
          presetInstrumentId={panel.mode === "create" ? panel.instrumentId : undefined}
          instrumentOptions={data.instrumentOptions}
          levelOptions={options.levels}
          onCancel={closePanel}
          onSubmit={submitSheet}
        />
      )}

      <ConfirmDialog
        open={visibility.pending !== null}
        onOpenChange={(open) => !open && visibility.cancel()}
        title={`Ẩn “${pendingSheet?.name}”?`}
        description="Sinh viên sẽ không còn thấy bản này. Bản đã lưu sẽ hiện “Không khả dụng”."
        confirmLabel="Ẩn"
        onConfirm={visibility.confirm}
        isLoading={visibility.isApplying}
      />
    </TeacherShell>
  );
}
