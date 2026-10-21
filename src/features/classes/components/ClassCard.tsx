import { Link } from "react-router-dom";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ClassSummary } from "@/features/classes/types/classTypes";
import { CLASS_STATUS_LABELS, formatDateRange } from "@/features/classes/utils/classFormat";

interface ClassCardProps {
  classSummary: ClassSummary;
}

const LINK_BUTTON_CLASSES =
  "inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13px] font-semibold text-bvc-ink";

export function ClassCard({ classSummary }: ClassCardProps) {
  const detailPath = `/teacher/classes/${classSummary.id}`;
  const isActive = classSummary.status === "ACTIVE";

  return (
    <article className="flex flex-col gap-[10px] rounded-[18px] border border-bvc-border p-[15px]">
      <Link to={detailPath} className="flex flex-col gap-[7px] text-bvc-ink">
        <span className="flex justify-between gap-[10px]">
          <span className="text-[16px] font-bold">{classSummary.name}</span>
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
      </Link>
      <div className="flex gap-[8px]">
        {isActive && (
          <Link to={`${detailPath}/edit`} className={LINK_BUTTON_CLASSES}>
            Sửa
          </Link>
        )}
        <Link to={detailPath} className={LINK_BUTTON_CLASSES}>
          Mở lớp
        </Link>
      </div>
    </article>
  );
}
