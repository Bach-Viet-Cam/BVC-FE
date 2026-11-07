import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ClassSummary } from "@/features/classes/types/classTypes";
import { CLASS_STATUS_LABELS, formatDateRange } from "@/features/classes/utils/classFormat";

interface ClassCardProps {
  classSummary: ClassSummary;
}

export function ClassCard({ classSummary }: ClassCardProps) {
  const isActive = classSummary.status === "ACTIVE";

  return (
    <Link
      to={`/teacher/classes/${classSummary.id}`}
      className="flex items-center gap-[10px] rounded-bvc-xl border border-bvc-border p-[15px] text-bvc-ink transition-colors hover:border-bvc-border-strong hover:text-bvc-ink"
    >
      <span className="flex min-w-0 grow flex-col gap-[7px]">
        <span className="flex justify-between gap-[10px]">
          <span className="text-[16px] font-semibold">{classSummary.name}</span>
          <StatusLabel label={CLASS_STATUS_LABELS[classSummary.status]} tone={isActive ? "ok" : "muted"} />
        </span>
        <span className="flex flex-wrap items-center gap-[10px] text-[12.5px] text-bvc-muted">
          <span className="whitespace-nowrap rounded-[8px] bg-bvc-soft px-[9px] py-[4px] text-[11.5px] text-bvc-ink">
            {classSummary.instrument.name}
          </span>
          <span>{classSummary.cohort}</span>
          <span className="font-bvc-mono">{formatDateRange(classSummary.startDate, classSummary.endDate)}</span>
          <span>{classSummary.memberCount} SV</span>
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-bvc-muted" aria-hidden />
    </Link>
  );
}
