import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { ReferenceTile } from "@/features/music-library/components/ReferenceTile";
import { useSheetRecording } from "@/features/music-library/hooks/useSheetRecording";
import type { SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { cn } from "@/shared/utils/cn";

interface SecondarySheetCardProps {
  sheet: SheetVersion;
  viewerHref: string;
  practiceAction?: ReactNode;
}

export const sheetPillClass =
  "inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[11.5px] font-medium";

export function SecondarySheetCard({ sheet, viewerHref, practiceAction }: SecondarySheetCardProps) {
  const recording = useSheetRecording(sheet);

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-bvc-border bg-white p-3">
      <ReferenceTile
        title={sheet.name}
        recording={recording}
        badges={
          <>
            {sheet.isMain && (
              <span className={cn(sheetPillClass, "bg-bvc-ink font-semibold text-white")}>Bản chính · GV</span>
            )}
            <span className={cn(sheetPillClass, "bg-white/85 text-bvc-ink")}>{sheet.level.name}</span>
          </>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {practiceAction}
        <Link
          to={viewerHref}
          className={
            practiceAction
              ? actionButtonClass("secondary", "sm", "hover:text-bvc-ink")
              : actionButtonClass("primary", "sm", "hover:text-white")
          }
        >
          Mở bản nhạc
        </Link>
      </div>
    </div>
  );
}
