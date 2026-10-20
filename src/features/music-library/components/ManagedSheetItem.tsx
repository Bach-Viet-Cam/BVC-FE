import { AudioLines, FileText, Video } from "lucide-react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { cn } from "@/shared/utils/cn";
import { AssetRow } from "@/features/music-library/components/AssetRow";
import { SheetBadges } from "@/features/music-library/components/SheetBadges";
import { VisibilitySwitch } from "@/features/music-library/components/VisibilitySwitch";
import { FILE_RULES, LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import type { LecturerSheetMusic, SheetAnalysis, SheetFileSlot } from "@/features/music-library/types/lecturerTypes";
import { formatDuration, formatFileSize } from "@/features/music-library/utils/mediaUtils";

interface ManagedSheetItemProps {
  sheet: LecturerSheetMusic;
  isSelected: boolean;
  isBusy: boolean;
  onEdit: (sheet: LecturerSheetMusic) => void;
  onReplaceFile: (sheet: LecturerSheetMusic, slot: SheetFileSlot, file: File) => void;
  onRequestVisibility: (sheet: LecturerSheetMusic, nextVisible: boolean) => void;
}

// Kết quả phân tích bản thu mẫu của bản chính (dịch vụ AI gọi lại sau khi xử lý)
function analysisNote(analysis: SheetAnalysis | null): { text: string; isWarning: boolean } | null {
  if (!analysis) return null;
  if (analysis.status === "PROCESSING") return { text: "Đang phân tích bản thu mẫu…", isWarning: false };
  // Phân tích chạy ngầm, không ảnh hưởng việc lưu: chỉ ghi chú nhẹ, không hiện như lỗi
  if (analysis.status === "ERROR") {
    return { text: "Chưa phân tích được bản thu mẫu. Bản nhạc vẫn đã được lưu.", isWarning: false };
  }
  if (analysis.status === "READY" && analysis.timeSignatureMissing) {
    return { text: "Bản nhạc thiếu số chỉ nhịp", isWarning: true };
  }
  return null;
}

export function ManagedSheetItem({
  sheet,
  isSelected,
  isBusy,
  onEdit,
  onReplaceFile,
  onRequestVisibility,
}: ManagedSheetItemProps) {
  const { sheet: sheetFile, audio, video } = sheet.files;
  const note = analysisNote(sheet.analysis);
  // Chưa công khai được (bản chính thiếu bản thu mẫu) thì khóa công tắc bật
  const cannotPublish = !sheet.canPublish && sheet.effectiveVisibility !== "PUBLIC";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-[18px] border bg-bvc-surface p-4 transition-colors",
        isSelected ? "border-bvc-ink" : "border-transparent",
        isBusy && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SheetBadges sheet={sheet} durationSec={sheet.durationSec} />
        <span
          className="ml-auto flex items-center gap-2"
          title={cannotPublish && sheet.canChangeVisibility ? LIBRARY_MESSAGES.mainNeedsRecording : undefined}
        >
          <VisibilitySwitch
            visibility={sheet.effectiveVisibility}
            itemName={sheet.name}
            disabled={isBusy || !sheet.canChangeVisibility || cannotPublish}
            onRequestChange={(nextVisible) => onRequestVisibility(sheet, nextVisible)}
          />
          <ActionButton variant="secondary" size="sm" onClick={() => onEdit(sheet)} disabled={isBusy}>
            Sửa
          </ActionButton>
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-base font-bold text-bvc-ink">{sheet.name}</span>
        {sheet.description && <span className="text-[13px] text-bvc-muted">{sheet.description}</span>}
        {note && (
          <span
            role="status"
            className={cn("text-[12.5px]", note.isWarning ? "font-semibold text-bvc-accent-text" : "text-bvc-muted")}
          >
            {note.text}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <AssetRow
          icon={<FileText className="size-4" strokeWidth={1.8} />}
          fileName={sheetFile?.name}
          meta={formatFileSize(sheetFile?.sizeBytes)}
          emptyText="Chưa có file bản nhạc"
          rule={FILE_RULES.sheet}
          disabled={isBusy}
          onReplace={(file) => onReplaceFile(sheet, "sheet", file)}
        />
        <AssetRow
          icon={<AudioLines className="size-4" strokeWidth={1.8} />}
          fileName={audio?.name}
          meta={formatDuration(audio?.durationSec)}
          emptyText={
            sheet.isMain ? LIBRARY_MESSAGES.mainNeedsRecording : "Chưa có bản thu mẫu · dùng bản thu của bản chính"
          }
          emptyTone={sheet.isMain ? "warn" : "muted"}
          rule={FILE_RULES.recording}
          disabled={isBusy}
          onReplace={(file) => onReplaceFile(sheet, "audio", file)}
        />
        <AssetRow
          icon={<Video className="size-4" strokeWidth={1.8} />}
          fileName={video?.name}
          meta={formatDuration(video?.durationSec)}
          emptyText="Chưa có video hướng dẫn"
          rule={FILE_RULES.video}
          disabled={isBusy}
          onReplace={(file) => onReplaceFile(sheet, "video", file)}
        />
      </div>
    </li>
  );
}
