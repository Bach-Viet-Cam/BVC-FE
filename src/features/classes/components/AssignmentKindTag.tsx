import { ASSIGNMENT_KIND_LABELS, type AssignmentKind } from "@/features/classes/utils/assignmentFormat";
import { cn } from "@/shared/utils/cn";

const KIND_TONES: Record<AssignmentKind, string> = {
  SOLO: "bg-bvc-ok-tint text-bvc-ok",
  ENSEMBLE: "bg-bvc-ink text-white",
  BONUS: "bg-bvc-accent-tint text-bvc-accent-text",
  OTHER: "bg-bvc-soft text-bvc-muted",
};

interface AssignmentKindTagProps {
  kind: AssignmentKind;
  className?: string;
}

export function AssignmentKindTag({ kind, className }: AssignmentKindTagProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 shrink-0 items-center rounded-full px-2.5 text-[12px] font-semibold whitespace-nowrap",
        KIND_TONES[kind],
        className
      )}
    >
      {ASSIGNMENT_KIND_LABELS[kind]}
    </span>
  );
}
