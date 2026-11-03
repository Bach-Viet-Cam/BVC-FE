import { CheckCircle2, AlertTriangle } from "lucide-react";
import { type AdminAlert } from "@/features/platform/types/adminTypes";

export interface OverviewAlertCardProps {
  alerts: AdminAlert[];
}

export function OverviewAlertCard({ alerts }: OverviewAlertCardProps) {
  const isOk = alerts.length === 0;

  if (isOk) {
    return (
      <div
        data-tone="ok"
        className="flex flex-col gap-[12px] rounded-[20px] border border-bvc-ok-border bg-bvc-ok-tint p-[16px]"
      >
        <div className="flex items-center gap-[8px]">
          <CheckCircle2 size={18} className="shrink-0 text-bvc-ok" />
          <span className="text-[14px] font-bold text-bvc-ok">Không có cảnh báo</span>
        </div>
        <div className="flex flex-col gap-[9px]">
          <div className="rounded-[14px] bg-white p-[11px_12px] text-[13px] text-bvc-muted">
            Hệ thống ổn định, không có cảnh báo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-tone="warn"
      className="flex flex-col gap-[12px] rounded-[20px] border border-bvc-warn-border bg-bvc-accent-tint p-[16px]"
    >
      <div className="flex items-center gap-[8px]">
        <AlertTriangle size={18} className="shrink-0 text-bvc-accent-text" />
        <span className="text-[14px] font-bold text-bvc-accent-text">Cần xử lý</span>
      </div>
      <div className="flex flex-col gap-[9px]">
        {alerts.map((alert) => (
          <div key={alert.code} className="flex flex-col gap-[2px] rounded-[14px] bg-white p-[11px_12px]">
            <span className="text-[14px] font-bold">{alert.level === "ERROR" ? "Lỗi" : "Cảnh báo"}</span>
            <span className="text-[12.5px] text-bvc-muted">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
