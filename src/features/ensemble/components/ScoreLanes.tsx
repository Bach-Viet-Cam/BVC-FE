import { type ReactNode } from "react";
import { Music2, Play, Pause, RotateCcw } from "lucide-react";
import { WaveformTimeline, type TimelineTake } from "@/features/ensemble/components/WaveformTimeline";
import { type EnsembleTrack, type TrackSetting } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";

interface ScoreLanesProps {
  title: string;
  subtitle?: string;
  tracks: EnsembleTrack[];
  settings: TrackSetting[];
  anySolo: boolean;
  trackAnalysers: ReadonlyMap<string, AnalyserNode>;
  peaksByTrack: ReadonlyMap<string, number[]>;
  durationSec: number;
  recordingStartedAt: number | null;
  previewPositionSec: number | null;
  onVolumeChange: (trackId: string, volume: number) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onReset: () => void;
  take?: TimelineTake | null;
  onTakeVolumeChange?: (volume: number) => void;
  onToggleTakeMute?: () => void;
  /** Nút thao tác bản thu (tải, xóa, ghi lại, gửi) đặt ngay dưới timeline. */
  takeActions?: ReactNode;
  /** Khung thu âm (sẵn sàng / đếm nhịp / đang ghi) nằm ngay dưới các làn. */
  recorder?: ReactNode;
  myLane?: ReactNode;
  myInstrumentId?: string;
  isRecording?: boolean;
  recordingPositionSec?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onSeek?: (seconds: number) => void;
  disabled?: boolean;
}

export function ScoreLanes(props: ScoreLanesProps) {
  const { previewPositionSec, isRecording, recordingStartedAt } = props;
  const durationSec = Math.max(props.durationSec, props.take?.durationSec ?? 0);
  const position = recordingStartedAt
    ? Math.min(durationSec, props.recordingPositionSec ?? 0)
    : (previewPositionSec ?? 0);
  return (
    <section
      aria-label={props.title}
      className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-bvc-lg border border-bvc-border bg-white p-3 sm:p-3.5"
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-col">
          <h2 className="flex min-w-0 items-center gap-2 text-[16px] font-semibold text-bvc-ink">
            <Music2 size={18} className="shrink-0" aria-hidden />
            <span className="truncate">{props.title}</span>
          </h2>
          {props.subtitle && <p className="truncate text-[11.5px] text-bvc-muted">{props.subtitle}</p>}
        </div>
        <span className="ml-auto text-[13px] tabular-nums text-bvc-muted">
          {formatClock(position)} / {formatClock(durationSec)}
        </span>
        {props.onTogglePlay && (
          <button
            type="button"
            onClick={props.onTogglePlay}
            disabled={props.disabled}
            aria-pressed={Boolean(props.isPlaying)}
            aria-label={props.isPlaying ? "Tạm dừng" : "Phát tất cả"}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-ink text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {props.isPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          </button>
        )}
        <button
          type="button"
          onClick={props.onReset}
          disabled={props.disabled}
          aria-label="Đặt lại"
          title="Đặt lại"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-muted hover:bg-bvc-surface disabled:opacity-50"
        >
          <RotateCcw size={16} aria-hidden />
        </button>
      </div>
      <WaveformTimeline
        tracks={props.tracks}
        settings={props.settings}
        anySolo={props.anySolo}
        peaksByTrack={props.peaksByTrack}
        durationSec={durationSec}
        positionSec={position}
        myInstrumentId={props.myInstrumentId}
        isRecording={isRecording}
        disabled={props.disabled}
        onToggleMute={props.onToggleMute}
        onVolumeChange={props.onVolumeChange}
        onSeek={props.onSeek}
        take={props.take}
        onTakeVolumeChange={props.onTakeVolumeChange}
        onToggleTakeMute={props.onToggleTakeMute}
      />
      {props.recorder}
      {props.takeActions}
      {props.myLane}
    </section>
  );
}
