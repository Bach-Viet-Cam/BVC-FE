import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ImportRow } from "@/features/classes/types/classTypes";
import { cn } from "@/shared/utils/cn";

interface ImportRowCardProps {
  row: ImportRow;
}

export function ImportRowCard({ row }: ImportRowCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[4px] rounded-[14px] border px-[13px] py-[11px]",
        row.isValid ? "border-bvc-border bg-white" : "border-bvc-accent-border bg-bvc-accent-tint"
      )}
    >
      <span className="flex justify-between gap-[8px]">
        <span className="text-[14px] font-bold">{row.fullName || "-"}</span>
        <span className="font-bvc-mono text-[11.5px] text-bvc-muted">dòng {row.rowNumber}</span>
      </span>
      <span className="break-all text-[12px] text-bvc-muted">
        <span className="font-bvc-mono">{row.studentCode || "-"}</span> · {row.email || "-"}
      </span>
      <StatusLabel
        label={row.isValid ? "Hợp lệ" : (row.reason ?? "Không hợp lệ")}
        tone={row.isValid ? "ok" : "warn"}
        className="text-[12px]"
      />
    </div>
  );
}
