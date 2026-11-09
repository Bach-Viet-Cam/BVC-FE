import { useState } from "react";
import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { cn } from "@/shared/utils/cn";
import { GuestSaveDialog } from "@/features/music-library/components/GuestSaveDialog";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import { practiceHref } from "@/features/music-library/utils/sheetUtils";

interface PracticeSheetButtonProps {
  sheetId: string;
  sheetName: string;
  assignmentId?: string;
  size?: "sm" | "md";
  className?: string;
}

export function PracticeSheetButton({
  sheetId,
  sheetName,
  assignmentId,
  size = "md",
  className,
}: PracticeSheetButtonProps) {
  const role = useViewerRole();
  const [isPromptOpen, setPromptOpen] = useState(false);
  if (role === "teacher" || role === "admin") return null;

  const href = practiceHref(sheetId, assignmentId);
  const buttonClass = actionButtonClass("primary", size, cn("hover:text-white", className));
  const content = (
    <>
      <Mic className="size-4 shrink-0" strokeWidth={1.9} aria-hidden />
      Luyện tập
    </>
  );

  if (role === "student") {
    return (
      <Link to={href} aria-label={`Luyện tập ${sheetName}`} className={buttonClass}>
        {content}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Luyện tập ${sheetName}`}
        onClick={() => setPromptOpen(true)}
        className={buttonClass}
      >
        {content}
      </button>
      <GuestSaveDialog
        open={isPromptOpen}
        onOpenChange={setPromptOpen}
        title={LIBRARY_MESSAGES.guestPracticeTitle}
        description={null}
        redirectTo={href}
      />
    </>
  );
}
