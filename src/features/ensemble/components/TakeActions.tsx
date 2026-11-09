import { Download, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface TakeActionsProps {
  sendDisabled: boolean;
  sendLabel: string;
  submitBlockedReason: string | null;
  onDownload: () => void;
  onDelete: () => void;
  onRerecord: () => void;
  onSend: () => void;
}

/** Thao tác với bản thu vừa ghi, nằm ngay dưới timeline tổng phổ. */
export function TakeActions(props: TakeActionsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={props.onDownload}
          className="flex min-h-11 cursor-pointer items-center gap-2 px-1 text-[13.5px] font-medium text-bvc-accent-text"
        >
          <Download size={18} strokeWidth={1.9} aria-hidden />
          Tải xuống
        </button>
        <button
          type="button"
          onClick={props.onDelete}
          className="flex min-h-11 cursor-pointer items-center gap-2 px-1 text-[13.5px] font-medium text-bvc-error"
        >
          <Trash2 size={18} strokeWidth={1.9} aria-hidden />
          Xóa bản thu
        </button>
        <div className="ml-auto flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={props.onRerecord}
            className="flex min-h-[50px] cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong bg-white px-5 text-[15px] font-medium whitespace-nowrap text-bvc-ink"
          >
            Ghi âm lại
          </button>
          <button
            type="button"
            disabled={props.sendDisabled}
            onClick={props.onSend}
            className={cn(
              "flex min-h-[50px] items-center justify-center rounded-full px-6 text-[15px] font-medium whitespace-nowrap",
              props.sendDisabled
                ? "cursor-not-allowed border border-bvc-border bg-bvc-surface text-bvc-faint"
                : "cursor-pointer bg-bvc-ink text-white"
            )}
          >
            {props.sendLabel}
          </button>
        </div>
      </div>
      {props.submitBlockedReason !== null && (
        <p className="text-[12px] text-bvc-accent-text">{props.submitBlockedReason}</p>
      )}
    </div>
  );
}
