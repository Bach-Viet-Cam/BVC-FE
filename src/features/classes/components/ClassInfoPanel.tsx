import { Link } from "react-router-dom";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ClassDetail } from "@/features/classes/types/classTypes";
import { CLASS_STATUS_LABELS, formatIsoDate } from "@/features/classes/utils/classFormat";

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
    <div className="flex flex-col gap-[2px]">
      <span className="text-[12px] text-bvc-muted">{label}</span>
      <span className={isMono ? "font-bvc-mono text-[14.5px] font-semibold" : "text-[14.5px] font-semibold"}>
        {value}
      </span>
    </div>
  );
}

export function ClassInfoPanel({ classDetail, onEndClass }: ClassInfoPanelProps) {
  const isActive = !classDetail.isReadOnly;
  return (
    <section className="mx-[18px] mb-[14px] flex shrink-0 flex-col gap-[12px] rounded-[18px] bg-bvc-soft p-[14px] lg:m-0 lg:gap-[16px] lg:rounded-[20px] lg:border lg:border-bvc-border lg:bg-white lg:p-[18px]">
      <div className="flex items-center gap-[8px]">
        <StatusLabel label={CLASS_STATUS_LABELS[classDetail.status]} tone={isActive ? "ok" : "muted"} />
        <span className="whitespace-nowrap rounded-[8px] bg-white px-[9px] py-[4px] text-[12px]">
          {classDetail.instrument.name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-[12px] gap-y-[10px] md:grid-cols-4 lg:grid-cols-2">
        <InfoItem label="Khóa" value={classDetail.cohort} />
        <InfoItem label="Thành viên" value={`${classDetail.memberCount} sinh viên`} />
        <InfoItem label="Ngày bắt đầu" value={formatIsoDate(classDetail.startDate)} isMono />
        <InfoItem label="Ngày kết thúc" value={formatIsoDate(classDetail.endDate)} isMono />
      </div>
      {isActive && (
        <div className="grid grid-cols-2 gap-[8px]">
          <Link
            to={`/teacher/classes/${classDetail.id}/edit`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13px] font-semibold text-bvc-ink"
          >
            Sửa
          </Link>
          <ActionButton variant="accent" onClick={onEndClass}>
            Kết thúc lớp
          </ActionButton>
        </div>
      )}
    </section>
  );
}
