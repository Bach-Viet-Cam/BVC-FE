import { Volume2 } from "lucide-react";
import { Pause, Play } from "lucide-react";
import { COUNT_IN_BEATS, SAMPLE } from "@/features/practice/constants/practiceConstants";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { RecordButton } from "@/features/practice/components/RecordButton";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { staticBars } from "@/features/practice/utils/practiceSimulation";
import type { RecordState } from "@/features/practice/types/practiceTypes";
import { Waveform } from "@/shared/components/bvc/Waveform";
import { cn } from "@/shared/utils/cn";

const IDLE_BARS = staticBars(44, 2.1).map((h) => ({ h: h * 70 }));
const PREVIEW_BARS = staticBars(40, 1.3);

interface RecordPanelProps {
  rec: RecordState;
  elapsed: number;
  countBeat: number;
  takeLen: number;
  playing: boolean;
  playPos: number;
  blocked: boolean;
  micDenied: boolean;
  uploading: boolean;
  errorText: string;
  weakMessage: string;
  sendDisabled: boolean;
  sendLabel: string;
  onStart: () => void;
  onStop: () => void;
  onTogglePlay: () => void;
  onRerecord: () => void;
  onSend: () => void;
}

export function RecordPanel({
  rec,
  elapsed,
  countBeat,
  takeLen,
  playing,
  playPos,
  blocked,
  micDenied,
  uploading,
  errorText,
  weakMessage,
  sendDisabled,
  sendLabel,
  onStart,
  onStop,
  onTogglePlay,
  onRerecord,
  onSend,
}: RecordPanelProps) {
  if (rec === "preview") {
    const playedRatio = takeLen > 0 ? playPos / takeLen : 0;
    return (
      <div className="mt-auto flex flex-col gap-3 md:mx-auto md:my-auto md:w-full md:max-w-[760px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={playing ? "Tạm dừng" : "Phát bản thu"}
            onClick={onTogglePlay}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[15px] bg-bvc-ink text-white"
          >
            {playing ? (
              <Pause size={19} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={19} fill="currentColor" strokeWidth={0} />
            )}
          </button>
          <div className="flex-1">
            <Waveform
              height={40}
              bars={PREVIEW_BARS.map((h, i) => ({
                h: h * 100,
                color:
                  i / PREVIEW_BARS.length <= playedRatio ? "var(--color-bvc-accent)" : "var(--color-bvc-bar-strong)",
              }))}
            />
          </div>
          <span className="shrink-0 text-xs text-bvc-muted">
            {fmtTime(playPos)} / {fmtTime(takeLen)}
          </span>
        </div>

        {errorText && <NoticeBanner message={errorText} />}
        {uploading && <NoticeBanner message={weakMessage} />}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onRerecord}
            className="flex min-h-[50px] flex-1 cursor-pointer items-center justify-center rounded-[15px] border border-bvc-border-strong bg-white text-[15px] font-semibold text-bvc-ink"
          >
            Ghi âm lại
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

  return (
    <div className="mt-auto flex flex-col gap-3 md:mx-auto md:my-auto md:w-full md:max-w-[760px]">
      {micDenied && <NoticeBanner message="Cần cho phép truy cập micro để dùng tính năng này." />}

      <div className="flex items-center gap-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
          {rec === "idle" && (
            <>
              <div className="flex items-center gap-[7px]">
                <span
                  className={cn("size-2 shrink-0 rounded-full", blocked || micDenied ? "bg-bvc-warn" : "bg-bvc-ok")}
                />
                <span
                  className={cn(
                    "text-[13.5px] font-bold",
                    blocked || micDenied ? "text-bvc-accent-text" : "text-bvc-ok"
                  )}
                >
                  {micDenied ? "Chưa thể ghi âm" : blocked ? "Tạm thời chưa ghi âm được" : "Sẵn sàng ghi âm"}
                </span>
              </div>
              <Waveform bars={IDLE_BARS} height={26} />
              <p className="text-[12.5px] leading-[1.45] text-bvc-muted">
                Chạm nút ghi để bắt đầu. Có 4 tiếng đếm nhịp trước khi ghi, phần đếm không được ghi lại.
              </p>
            </>
          )}

          {rec === "countin" && (
            <>
              <div className="flex items-center gap-2">
                <Volume2 size={18} strokeWidth={1.9} className="text-bvc-ink" />
                <span className="text-sm font-bold text-bvc-ink">Đếm nhịp · {SAMPLE.targetBpm} BPM</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: COUNT_IN_BEATS }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex min-h-[34px] items-center justify-center rounded-[10px] text-sm font-semibold",
                      i <= countBeat ? "bg-bvc-accent text-white" : "bg-bvc-surface text-bvc-faint"
                    )}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <p className="text-[12.5px] leading-[1.45] text-bvc-muted">
                Tiếng đếm nhịp không được ghi lại. Ghi âm bắt đầu khi đếm xong.
              </p>
            </>
          )}

          {rec === "recording" && (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-bvc-ink">
                  <span className="size-2 rounded-full bg-bvc-warn" />
                  Đang ghi
                </span>
                <span className="text-[15px] font-semibold text-bvc-ink">
                  {fmtTime(elapsed)} / {fmtTime(SAMPLE.pieceLen)}
                </span>
              </div>
              <Waveform
                height={38}
                bars={staticBars(30, elapsed).map((h) => ({
                  h: h * 100,
                  color: "var(--color-bvc-accent)",
                }))}
              />
              <p className="text-[12.5px] leading-[1.45] text-bvc-muted">
                Chạm nút dừng khi chơi xong, hoặc ghi đến hết bài.
              </p>
            </>
          )}
        </div>

        {rec === "idle" && <RecordButton variant="record" disabled={blocked || micDenied} onClick={onStart} />}
        {rec === "countin" && <RecordButton variant="count" countNumber={countBeat + 1} />}
        {rec === "recording" && <RecordButton variant="stop" onClick={onStop} />}
      </div>
    </div>
  );
}
