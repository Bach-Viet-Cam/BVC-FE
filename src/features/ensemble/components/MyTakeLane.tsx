import { Download, Headphones, Mic2, Sparkles, Trash2 } from "lucide-react";
import { LevelMeter } from "@/features/ensemble/components/LevelMeter";
import { type TakePlayback } from "@/features/ensemble/hooks/useTakePlayback";
import { type EnsembleTake, type PracticeStatus } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { LiveWaveform } from "@/shared/components/bvc/LiveWaveform";
import { PlaybackBar } from "@/shared/components/bvc/PlaybackBar";
import { Switch } from "@/shared/components/ui/switch";

const WAVE_HEIGHT = 80;

interface MyTakeLaneProps {
  status: PracticeStatus;
  myInstrumentName: string;
  micAnalyser: AnalyserNode | null;
  isCountInOn: boolean;
  take: EnsembleTake | null;
  playback: TakePlayback;
  isAccompanied: boolean;
  onAccompanimentChange: (checked: boolean) => void;
  onDownload: () => void;
  onDiscard: () => void;
}

export function MyTakeLane(props: MyTakeLaneProps) {
  const { status, take, playback } = props;
  const hasTake = take !== null && (status === "preview" || status === "saving" || status === "saved");

  return (
    <section
      aria-label={`Bè của bạn: ${props.myInstrumentName}`}
      className="flex min-h-0 flex-1 flex-col justify-between rounded-lg border border-bvc-border bg-white p-3.5 shadow-sm md:p-4"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-bvc-border/70 pb-2.5">
        <div className="flex items-center gap-2">
          <LevelMeter
            analyser={status === "recording" ? props.micAnalyser : null}
            label={`Micro bè ${props.myInstrumentName}`}
          />
          <div className="flex items-center gap-2">
            <h2 className="font-bvc-display text-[14px] font-extrabold tracking-wide text-bvc-ink uppercase">
              Bè của bạn · {props.myInstrumentName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold">
          {status === "ready" && (
            <span className="flex items-center gap-1 text-bvc-ok">
              <span className="size-2 rounded-full bg-bvc-ok" />
              Micro sẵn sàng
            </span>
          )}
          {status === "countIn" && (
            <span className="flex items-center gap-1 text-amber-700">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              Đang đếm nhịp...
            </span>
          )}
          {status === "recording" && (
            <span className="flex items-center gap-1 text-bvc-error">
              <span className="size-2 rounded-full bg-bvc-error animate-ping" />
              Đang ghi trực tiếp
            </span>
          )}
          {hasTake && (
            <span className="flex items-center gap-1 text-bvc-ink">
              <Sparkles size={13} className="text-bvc-accent" />
              Đã có bản thu ({formatClock(take.durationSec)})
            </span>
          )}
        </div>
      </div>

      <div className="my-auto flex flex-col justify-center py-2">
        {hasTake ? (
          <div className="flex flex-col gap-3">
            <PlaybackBar
              peaks={take.peaks}
              playing={playback.playing}
              playPos={playback.playPos}
              takeLen={take.durationSec}
              volume={playback.volume}
              muted={playback.muted}
              rate={playback.rate}
              onTogglePlay={playback.togglePlay}
              onSeek={playback.seek}
              onVolumeChange={playback.setVolume}
              onToggleMute={playback.toggleMute}
              onRateChange={playback.setRate}
            />

            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-bvc-border/80 bg-bvc-surface/40 px-3 py-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] font-semibold text-bvc-ink">
                <Headphones size={15} className="text-bvc-accent" />
                <span>Nghe cùng dàn bè tổng phổ</span>
                <Switch checked={props.isAccompanied} onCheckedChange={props.onAccompanimentChange} />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={props.onDownload}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-bvc-border bg-white px-2.5 py-1 text-[12px] font-semibold text-bvc-accent-text transition-colors hover:bg-bvc-surface"
                >
                  <Download size={14} strokeWidth={2} />
                  <span>Tải WAV</span>
                </button>
                {status === "preview" && (
                  <button
                    type="button"
                    onClick={props.onDiscard}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-1 text-[12px] font-semibold text-bvc-error transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    <span>Xóa bản thu</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <LiveWaveform
              analyser={status === "recording" ? props.micAnalyser : null}
              active={status === "recording"}
              height={WAVE_HEIGHT}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-bvc-border/70 pt-2 text-[11px] text-bvc-faint">
        <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-bvc-border/70 bg-bvc-surface/40 p-2.5 text-[11.5px] text-bvc-muted md:grid-cols-2">
          <div className="flex items-start gap-1.5">
            <Headphones size={14} className="mt-0.5 shrink-0 text-bvc-accent" />
            <span>Đeo tai nghe để âm thanh các bè không lọt vào mic của bạn.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Mic2 size={14} className="mt-0.5 shrink-0 text-bvc-accent" />
            <span>Đặt micro cách đàn từ 30 - 50cm để thu tiếng đàn vang rõ nhất.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
