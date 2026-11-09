import { Activity, Award, BookOpen, Mic, Music2, type LucideIcon } from "lucide-react";
import { type AssignmentType } from "@/features/classes/types/assignmentTypes";

const ICONS: Record<AssignmentType, LucideIcon> = {
  RHYTHM: Activity,
  RECORDING: Mic,
  PRACTICE: Music2,
  EXAM: Award,
  SHEET: BookOpen,
  BONUS: Award,
};

interface AssignmentTypeIconProps {
  type: AssignmentType;
  size?: number;
  className?: string;
}

export function AssignmentTypeIcon({ type, size = 15, className }: AssignmentTypeIconProps) {
  const Icon = ICONS[type];
  return <Icon size={size} strokeWidth={1.9} className={className} aria-hidden />;
}
