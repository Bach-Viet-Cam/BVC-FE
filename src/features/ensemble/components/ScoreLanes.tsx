import { type CSSProperties, type ReactNode } from "react";
import { Music2, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LaneWave } from "@/features/ensemble/components/LaneWave";
import { type EnsembleTrack, type TrackSetting } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { ActionButton } from "@/shared/components/bvc/ActionButton";

interface ScoreLanesProps {
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
  const { durationSec, previewPositionSec, isRecording, recordingStartedAt } = props;
  const position = recordingStartedAt
    ? Math.min(durationSec, props.recordingPositionSec ?? 0)
    : (previewPositionSec ?? 0);
  return (
    <section
      aria-label="Tổng phổ các bè"
      className="flex min-w-0 flex-col gap-4 rounded-bvc-lg border border-bvc-border bg-white p-4 sm:p-5"
      style={{ "--progress": `${durationSec ? (position / durationSec) * 100 : 0}%` } as CSSProperties}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-bvc-ink">
          <Music2 size={20} aria-hidden />
          Tổng phổ các bè
        </h2>
        <button
          type="button"
          onClick={props.onReset}
          disabled={props.disabled}
          className="flex min-h-11 items-center gap-2 text-sm text-bvc-muted disabled:opacity-50"
        >
          <RotateCcw size={16} aria-hidden />
          Đặt lại
        </button>
      </div>
      {props.onTogglePlay && (
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton onClick={props.onTogglePlay} disabled={props.disabled} aria-pressed={Boolean(props.isPlaying)}>
            {props.isPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
            {props.isPlaying ? "Tạm dừng các bè" : "Phát các bè"}
          </ActionButton>
          <span className="text-sm tabular-nums text-bvc-muted">
            {formatClock(position)} / {formatClock(durationSec)}
          </span>
        </div>
      )}
      {props.onSeek && (
        <input
          type="range"
          min={0}
          max={durationSec}
          step={0.1}
          value={position}
          disabled={props.disabled}
          onChange={(event) => props.onSeek?.(Number(event.target.value))}
          aria-label="Vị trí phát các bè"
          className="min-h-11 w-full min-w-0 cursor-pointer accent-bvc-ink"
        />
      )}
      <ul className="flex min-w-0 flex-col gap-3">
        {props.tracks.map((track) => {
          const setting = props.settings.find((item) => item.trackId === track.id);
          if (!setting) return null;
          const isOwn = track.instrumentId === props.myInstrumentId;
          const silenced = setting.isMuted || (props.anySolo && !setting.isSolo) || Boolean(isOwn && isRecording);
          return (
            <li
              key={track.id}
              className="grid min-w-0 gap-2 border-t border-bvc-border pt-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center"
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-semibold text-bvc-ink">{track.instrumentName}</h3>
                  {isOwn && (
                    <p className="text-[13px] text-bvc-muted">{isRecording ? "Đang thu bè của bạn" : "Bè của bạn"}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`${setting.isMuted ? "Bật" : "Tắt"} tiếng ${track.instrumentName}`}
                  aria-pressed={setting.isMuted}
                  disabled={Boolean(isOwn && isRecording)}
                  onClick={() => props.onToggleMute(track.id)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-bvc-ink hover:bg-bvc-surface disabled:opacity-50"
                >
                  {silenced ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  disabled={!props.onSeek || props.disabled}
                  aria-label={`Chọn vị trí phát bè ${track.instrumentName}`}
                  className="block w-full min-w-0 text-left disabled:cursor-default"
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    props.onSeek?.(
                      Math.max(0, Math.min(durationSec, ((event.clientX - rect.left) / rect.width) * durationSec))
                    );
                  }}
                >
                  <LaneWave
                    peaks={props.peaksByTrack.get(track.id) ?? []}
                    startPercent={durationSec ? (track.offsetMs / 1000 / durationSec) * 100 : 0}
                    widthPercent={durationSec ? (track.durationSec / durationSec) * 100 : 100}
                    isSilenced={silenced}
                    showPlayhead={position > 0 || Boolean(isRecording)}
                  />
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={setting.volume}
                  onChange={(event) => props.onVolumeChange(track.id, Number(event.target.value))}
                  aria-label={`Âm lượng ${track.instrumentName}`}
                  className="min-h-11 w-full min-w-0 cursor-pointer accent-bvc-ink"
                />
              </div>
            </li>
          );
        })}
      </ul>
      {props.myLane}
    </section>
  );
}
