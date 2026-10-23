import { Pause, Play, Upload } from "lucide-react";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { fmtTime, mbText } from "@/features/practice/utils/practiceFormat";
import type { RecordingFile } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

interface UploadPanelProps {
  file: RecordingFile | null;
  playing: boolean;
  position: number;
  blocked: boolean;
  weakNetwork: boolean; // MSG-17 trong lúc tải lên
  errorText: string;
  weakMessage: string;
  sendDisabled: boolean;
  sendLabel: string;
  onPick: () => void;
  onPickOther: () => void;
  onTogglePlay: () => void;
  onSend: () => void;
}

export function UploadPanel({
  file,
  playing,
  position,
  blocked,
  weakNetwork,
  errorText,
  weakMessage,
  sendDisabled,
  sendLabel,
  onPick,
  onPickOther,
  onTogglePlay,
  onSend,
}: UploadPanelProps) {
  if (!file) {
    return (
      <button
        type="button"
        disabled={blocked}
        onClick={onPick}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-2 rounded-bvc-xl",
          "border-[1.5px] border-dashed border-bvc-border-strong bg-bvc-surface text-bvc-ink",
          blocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        <Upload size={34} strokeWidth={1.7} />
        <span className="text-[15px] font-bold">Chọn file ghi âm từ thiết bị</span>
        <span className="text-[12.5px] text-bvc-muted">MP3, WAV, M4A · tối đa 20 MB</span>
      </button>
    );
  }

  const progress = file.dur > 0 ? (position / file.dur) * 100 : 0;

  return (
    <div className="mt-auto flex flex-col gap-3 md:mx-auto md:my-auto md:w-full md:max-w-[760px]">
      <div className="flex flex-col gap-2.5 rounded-bvc-lg border border-bvc-border bg-bvc-surface p-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={playing ? "Tạm dừng" : "Nghe thử file"}
            onClick={onTogglePlay}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[15px] bg-bvc-ink text-white"
          >
            {playing ? (
              <Pause size={19} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={19} fill="currentColor" strokeWidth={0} />
            )}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-bold text-bvc-ink">{file.name}</span>
            <span className="text-[12.5px] text-bvc-muted">
              {mbText(file.mb)} · {fmtTime(file.dur)}
            </span>
          </div>
        </div>
        <span className="block h-1 rounded-full bg-bvc-border">
          <span className="block h-1 rounded-full bg-bvc-accent" style={{ width: `${Math.min(100, progress)}%` }} />
        </span>
      </div>

      {errorText && <NoticeBanner message={errorText} />}
      {weakNetwork && <NoticeBanner message={weakMessage} />}

      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={blocked}
          onClick={onPickOther}
          className={cn(
            "flex min-h-[50px] flex-1 items-center justify-center rounded-[15px] border text-[15px] font-semibold",
            blocked
              ? "cursor-not-allowed border-bvc-border bg-bvc-surface text-bvc-faint"
              : "cursor-pointer border-bvc-border-strong bg-white text-bvc-ink"
          )}
        >
          Chọn file khác
        </button>
        <button
          type="button"
          disabled={sendDisabled}
          onClick={onSend}
          className={cn(
            "flex min-h-[50px] flex-1 items-center justify-center rounded-[15px] text-[15px] font-semibold",
            sendDisabled
              ? "cursor-not-allowed border border-bvc-border bg-bvc-surface text-bvc-faint"
              : "cursor-pointer bg-bvc-ink text-white"
          )}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}
