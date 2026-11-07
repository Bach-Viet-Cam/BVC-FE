import { Link } from "react-router-dom";
import { MoreHorizontal, NotebookPen, Pencil } from "lucide-react";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ClassDetail } from "@/features/classes/types/classTypes";
import { CLASS_STATUS_LABELS, formatDateRange } from "@/features/classes/utils/classFormat";
import { classAssignmentsPath } from "@/features/classes/utils/teacherAssignmentFormat";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface ClassInfoPanelProps {
  classDetail: ClassDetail;
  onEndClass: () => void;
}

interface InfoItemProps {
  label: string;
  value: string;
  isMono?: boolean;
}

function InfoItem({ label, value, isMono = false }: InfoItemProps) {
  return (
    <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
      <span className="text-[12px] text-bvc-muted">{label}</span>
      <span className={isMono ? "font-bvc-mono text-[13.5px] font-medium" : "text-[13.5px] font-medium"}>{value}</span>
    </span>
  );
}

const SECONDARY_LINK = actionButtonClass("secondary", "sm", "hover:text-bvc-ink");

export function ClassInfoPanel({ classDetail, onEndClass }: ClassInfoPanelProps) {
  const isActive = !classDetail.isReadOnly;
  return (
    <section
      aria-label="Thông tin lớp"
      className="flex shrink-0 flex-col gap-[12px] border-b border-bvc-border px-[18px] pb-[14px] lg:flex-row lg:items-center lg:justify-between lg:gap-[24px] lg:px-[32px] lg:py-[14px]"
    >
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[8px]">
        <StatusLabel label={CLASS_STATUS_LABELS[classDetail.status]} tone={isActive ? "ok" : "muted"} />
        <span className="whitespace-nowrap rounded-[8px] bg-bvc-soft px-[9px] py-[4px] text-[12px]">
          {classDetail.instrument.name}
        </span>
        <InfoItem label="Khóa" value={classDetail.cohort} />
        <InfoItem label="Sĩ số" value={`${classDetail.memberCount} SV`} />
        <InfoItem label="Thời gian" value={formatDateRange(classDetail.startDate, classDetail.endDate)} isMono />
      </div>
      <div className="flex flex-wrap items-center gap-[8px]">
        <Link to={classAssignmentsPath(classDetail.id)} className={SECONDARY_LINK}>
          <NotebookPen size={15} strokeWidth={1.9} aria-hidden="true" />
          Bài tập của lớp
        </Link>
        {isActive && (
          <>
            <Link to={`/teacher/classes/${classDetail.id}/edit`} className={SECONDARY_LINK}>
              <Pencil size={14} strokeWidth={1.9} aria-hidden="true" />
              Sửa lớp
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Thao tác khác"
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong bg-white text-bvc-ink transition-colors hover:bg-bvc-surface"
              >
                <MoreHorizontal size={16} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-[12px] border-bvc-border bg-white p-1.5 shadow-level-1">
                <DropdownMenuItem
                  onClick={onEndClass}
                  className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[13px] text-bvc-error data-highlighted:bg-bvc-accent-tint data-highlighted:text-bvc-error"
                >
                  Kết thúc lớp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </section>
  );
}
