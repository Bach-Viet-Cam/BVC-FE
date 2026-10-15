import { AudioLines, FileText, Video } from "lucide-react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { cn } from "@/shared/utils/cn";
import { AssetRow } from "@/features/music-library/components/AssetRow";
import { SheetBadges } from "@/features/music-library/components/SheetBadges";
import { VisibilitySwitch } from "@/features/music-library/components/VisibilitySwitch";
import { FILE_RULES, LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import type { SheetAsset } from "@/features/music-library/hooks/useSongSheets";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration, formatFileSize } from "@/features/music-library/utils/mediaUtils";

interface ManagedSheetItemProps {
  sheet: SheetVersion;
  isSelected: boolean;
  isBusy: boolean;
  onEdit: (sheet: SheetVersion) => void;
  onReplaceAsset: (sheet: SheetVersion, asset: SheetAsset, file: File) => void;
  onRequestVisibility: (sheet: SheetVersion, nextVisible: boolean) => void;
}

export function ManagedSheetItem({
  sheet,
  isSelected,
  isBusy,
  onEdit,
  onReplaceAsset,
  onRequestVisibility,
}: ManagedSheetItemProps) {
  const recording = sheet.referenceRecording;
  const video = sheet.tutorialVideo;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-[18px] border bg-bvc-surface p-4 transition-colors",
        isSelected ? "border-bvc-ink" : "border-transparent",
        isBusy && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SheetBadges sheet={sheet} recording={recording} />
        <span className="ml-auto flex items-center gap-2">
          <VisibilitySwitch
            visibility={sheet.visibility}
            itemName={sheet.name}
            disabled={isBusy}
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
      </div>

      <div className="flex flex-col gap-1.5">
        <AssetRow
          icon={<FileText className="size-4" strokeWidth={1.8} />}
          fileName={sheet.sheetFile.name}
          meta={formatFileSize(sheet.sheetFile.sizeBytes)}
          emptyText="Chưa có file bản nhạc"
          rule={FILE_RULES.sheet}
          disabled={isBusy}
          onReplace={(file) => onReplaceAsset(sheet, "sheetFile", file)}
        />
        <AssetRow
          icon={<AudioLines className="size-4" strokeWidth={1.8} />}
          fileName={recording?.name}
          meta={formatDuration(recording?.durationSec)}
          emptyText={
            sheet.isMain ? LIBRARY_MESSAGES.mainNeedsRecording : "Chưa có bản thu mẫu · dùng bản thu của bản chính"
          }
          emptyTone={sheet.isMain ? "warn" : "muted"}
          rule={FILE_RULES.recording}
          disabled={isBusy}
          onReplace={(file) => onReplaceAsset(sheet, "referenceRecording", file)}
        />
        <AssetRow
          icon={<Video className="size-4" strokeWidth={1.8} />}
          fileName={video?.name}
          meta={formatDuration(video?.durationSec)}
          emptyText="Chưa có video hướng dẫn"
          rule={FILE_RULES.video}
          disabled={isBusy}
          onReplace={(file) => onReplaceAsset(sheet, "tutorialVideo", file)}
        />
      </div>
    </li>
  );
}
