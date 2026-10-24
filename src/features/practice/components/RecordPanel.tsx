import { Download, Trash2, Volume2 } from "lucide-react";
import { COUNT_IN_BEATS, PRACTICE_DEFAULTS } from "@/features/practice/constants/practiceConstants";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { PlaybackBar } from "@/shared/components/bvc/PlaybackBar";
import { LiveWaveform } from "@/shared/components/bvc/LiveWaveform";
import { RecordButton } from "@/features/practice/components/RecordButton";
import { ReferenceAudioPlayer } from "@/features/practice/components/ReferenceAudioPlayer";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import type { RecordState } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

interface RecordPanelProps {
  rec: RecordState;
  elapsed: number;
  countBeat: number;
  takeLen: number;
  previewPeaks: number[];
  analyser: AnalyserNode | null;
  playing: boolean;
  playPos: number;
  blocked: boolean;
  micDenied: boolean;
  weakNetwork: boolean; // MSG-17 trong lúc tải lên
  errorText: string;
  weakMessage: string;
  sendDisabled: boolean;
  sendLabel: string;
  onStart: () => void;
  onStop: () => void;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
  volume: number;
  muted: boolean;
  rate: number;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  onRerecord: () => void;
  onDownload: () => void;
  onSend: () => void;
  // Bản thu mẫu của bản nhạc, nghe được khi chưa ghi; null khi bản nhạc chưa có bản thu mẫu
  referenceAudio: { url: string; isFallback: boolean } | null;
}

export function RecordPanel({
  rec,
  elapsed,
  countBeat,
  takeLen,
  previewPeaks,
  analyser,
  playing,
  playPos,
  blocked,
  micDenied,
  weakNetwork,
  errorText,
  weakMessage,
  sendDisabled,
  sendLabel,
  onStart,
  onStop,
  onTogglePlay,
  onSeek,
  volume,
  muted,
  rate,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  onRerecord,
  onDownload,
  onSend,
  referenceAudio,
}: RecordPanelProps) {
  if (rec === "preview") {
    return (
      <div className="mt-auto flex flex-col gap-3 md:mx-auto md:my-auto md:w-full md:min-w-0 md:max-w-[760px] xl:max-w-[920px]">
        <div className="flex flex-wrap items-center gap-3">
          <PlaybackBar
            peaks={previewPeaks}
            playing={playing}
            playPos={playPos}
            takeLen={takeLen}
            volume={volume}
            muted={muted}
            rate={rate}
            onTogglePlay={onTogglePlay}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
            onRateChange={onRateChange}
          />
          <div className="ml-auto flex shrink-0 gap-2.5">
            <button
              type="button"
              onClick={onRerecord}
              className="flex min-h-[50px] flex-1 cursor-pointer items-center justify-center rounded-[15px] border border-bvc-border-strong bg-white px-5 text-[15px] font-semibold whitespace-nowrap text-bvc-ink"
            >
              Ghi âm lại
            </button>
            <button
              type="button"
              disabled={sendDisabled}
              onClick={onSend}
              className={cn(
                "flex min-h-[50px] flex-1 items-center justify-center rounded-[15px] px-6 text-[15px] font-semibold",
                sendDisabled
                  ? "cursor-not-allowed border border-bvc-border bg-bvc-surface text-bvc-faint"
                  : "cursor-pointer bg-bvc-ink text-white"
              )}
            >
              {sendLabel}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onDownload}
            className="flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold text-bvc-accent-text"
          >
            <Download size={18} strokeWidth={1.9} />
            Tải xuống
          </button>
          <button
            type="button"
            onClick={onRerecord}
            className="flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold text-bvc-error"
          >
            <Trash2 size={18} strokeWidth={1.9} />
            Xóa bản thu
          </button>
        </div>

        {errorText && <NoticeBanner message={errorText} />}
        {weakNetwork && <NoticeBanner message={weakMessage} />}
      </div>
    );
  }

  return (
    <div className="mt-auto flex flex-col gap-3 md:mx-auto md:my-auto md:w-full md:min-w-0 md:max-w-[760px] xl:max-w-[920px]">
      {micDenied && <NoticeBanner message="Cần cho phép truy cập micro để dùng tính năng này." />}

      {rec === "idle" && referenceAudio && (
        <ReferenceAudioPlayer
          key={referenceAudio.url}
          url={referenceAudio.url}
          isFallback={referenceAudio.isFallback}
        />
      )}

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
              <LiveWaveform analyser={analyser} active={false} height={96} />
              <p className="text-[12.5px] leading-[1.45] text-bvc-muted">
                Chạm nút ghi để bắt đầu. Có 4 tiếng đếm nhịp trước khi ghi, phần đếm không được ghi lại.
              </p>
            </>
          )}

          {rec === "countin" && (
            <>
              <div className="flex items-center gap-2">
                <Volume2 size={18} strokeWidth={1.9} className="text-bvc-ink" />
                <span className="text-sm font-bold text-bvc-ink">Đếm nhịp · {PRACTICE_DEFAULTS.targetBpm} BPM</span>
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
                  {fmtTime(elapsed)} / {fmtTime(PRACTICE_DEFAULTS.pieceLen)}
                </span>
              </div>
              <LiveWaveform analyser={analyser} active height={96} />
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
