import { type ReactNode, useEffect, useRef } from "react";
import { Headphones, Music2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LaneWave } from "@/features/ensemble/components/LaneWave";
import { LevelMeter } from "@/features/ensemble/components/LevelMeter";
import { type EnsembleTrack, type TrackSetting } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { cn } from "@/shared/utils/cn";

const LANE_GRID = "grid grid-cols-[142px_minmax(0,1fr)_96px] items-center gap-2.5";
const RULER_STEP_SEC = 5;

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
}

export function ScoreLanes(props: ScoreLanesProps) {
  const { tracks, settings, anySolo, durationSec, recordingStartedAt, previewPositionSec } = props;
  const rootRef = useRef<HTMLElement | null>(null);
  const showPlayhead = recordingStartedAt !== null || previewPositionSec !== null;

  // Kim chạy: ghi --progress mỗi khung hình, không re-render.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (previewPositionSec !== null && durationSec > 0) {
      root.style.setProperty("--progress", `${Math.min(100, (previewPositionSec / durationSec) * 100).toFixed(2)}%`);
      return;
    }
    if (recordingStartedAt === null || durationSec <= 0) {
      root.style.setProperty("--progress", "0%");
      return;
    }
    let frame = 0;
    const tick = () => {
      const ratio = Math.min(1, (Date.now() - recordingStartedAt) / (durationSec * 1000));
      root.style.setProperty("--progress", `${(ratio * 100).toFixed(2)}%`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [recordingStartedAt, durationSec, previewPositionSec]);

  const ticks =
    durationSec > 0
      ? Array.from({ length: Math.floor(durationSec / RULER_STEP_SEC) + 1 }, (_, index) => index * RULER_STEP_SEC)
      : [];

  return (
    <section
      ref={rootRef}
      aria-label="Tổng phổ các bè"
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col justify-between rounded-lg border border-bvc-border bg-white p-3.5 shadow-sm md:p-4"
    >
      {/* Header tổng phổ */}
      <div className="flex shrink-0 items-center justify-between border-b border-bvc-border/70 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-bvc-surface text-bvc-ink">
            <Music2 size={15} strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-bvc-display text-[14px] font-extrabold tracking-wide text-bvc-ink uppercase">
              Tổng phổ các bè
            </h2>
            <span className="rounded-md bg-bvc-surface px-2 py-0.5 text-[11px] font-semibold text-bvc-muted">
              {tracks.length} bè mẫu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {anySolo && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
              Solo đang bật
            </span>
          )}
          <button
            type="button"
            onClick={props.onReset}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-bvc-border px-2.5 py-1 text-[12px] font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface"
          >
            <RotateCcw size={13} strokeWidth={2} />
            Đặt lại
          </button>
        </div>
      </div>

      {/* Thước thời gian (thẳng cột với LaneWave) */}
      <div className={cn(LANE_GRID, "shrink-0 py-1 text-[11px]")} aria-hidden>
        <span className="text-[10.5px] font-bold tracking-wider text-bvc-faint uppercase">Bè & Điều khiển</span>
        <div className="relative h-4.5 border-b border-bvc-border/70">
          {ticks.map((second) => (
            <span
              key={second}
              className="absolute -translate-x-1/2 font-bvc-mono text-[10.5px] text-bvc-faint first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(second / durationSec) * 100}%` }}
            >
              {formatClock(second)}
            </span>
          ))}
        </div>
        <span className="text-right text-[10.5px] font-bold tracking-wider text-bvc-faint uppercase">Âm lượng</span>
      </div>

      {/* Danh sách các track bè hòa tấu */}
      <div className="flex min-h-0 flex-1 flex-col justify-around gap-1.5 overflow-y-auto no-scrollbar py-0.5">
        {tracks.map((track) => {
          const setting = settings.find((item) => item.trackId === track.id);
          if (!setting) return null;
          const isSilenced = setting.isMuted || (anySolo && !setting.isSolo);
          const startPercent = durationSec > 0 ? Math.min(100, (track.offsetMs / 1000 / durationSec) * 100) : 0;
          const widthPercent =
            durationSec > 0 ? Math.min(100 - startPercent, (track.durationSec / durationSec) * 100) : 100;
          const VolumeIcon = setting.volume === 0 || setting.isMuted ? VolumeX : Volume2;

          return (
            <div
              key={track.id}
              className={cn(
                LANE_GRID,
                "rounded-xl border border-bvc-border/70 bg-bvc-surface/30 px-2.5 py-1 transition-all hover:border-bvc-border hover:bg-bvc-surface/60",
                isSilenced && "opacity-60"
              )}
            >
              {/* Cột 1: Thông tin nhạc cụ & Nút M / S */}
              <div className="flex min-w-0 items-center justify-between gap-1.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <LevelMeter
                    analyser={isSilenced ? null : (props.trackAnalysers.get(track.id) ?? null)}
                    label={track.instrumentName}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span
                      className={cn(
                        "truncate text-[13px] font-bold",
                        isSilenced ? "text-bvc-muted line-through" : "text-bvc-ink"
                      )}
                    >
                      {track.instrumentName}
                    </span>
                    <span className="truncate text-[10px] text-bvc-faint">Bè mẫu · GV</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Tắt tiếng ${track.instrumentName}`}
                    aria-pressed={setting.isMuted}
                    onClick={() => props.onToggleMute(track.id)}
                    className={cn(
                      "size-6.5 shrink-0 cursor-pointer rounded-md text-[11px] font-extrabold transition-all",
                      setting.isMuted
                        ? "bg-bvc-ink text-white shadow-sm ring-1 ring-bvc-ink"
                        : "border border-bvc-border bg-white text-bvc-muted hover:border-bvc-ink/40 hover:text-bvc-ink"
                    )}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    aria-label={`Solo ${track.instrumentName}`}
                    aria-pressed={setting.isSolo}
                    onClick={() => props.onToggleSolo(track.id)}
                    className={cn(
                      "size-6.5 shrink-0 cursor-pointer rounded-md text-[11px] font-extrabold transition-all",
                      setting.isSolo
                        ? "bg-amber-600 text-white shadow-sm ring-1 ring-amber-600"
                        : "border border-bvc-border bg-white text-bvc-muted hover:border-amber-600/40 hover:text-bvc-ink"
                    )}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Cột 2: Sóng âm đồng bộ */}
              <LaneWave
                peaks={props.peaksByTrack.get(track.id) ?? []}
                startPercent={startPercent}
                widthPercent={widthPercent}
                isSilenced={isSilenced}
                showPlayhead={showPlayhead}
              />

              {/* Cột 3: Thanh trượt âm lượng */}
              <div className="flex items-center gap-1.5">
                <VolumeIcon size={14} className={isSilenced ? "text-bvc-faint" : "text-bvc-muted"} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={setting.volume}
                  aria-label={`Âm lượng ${track.instrumentName}`}
                  onChange={(event) => props.onVolumeChange(track.id, Number(event.target.value))}
                  className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[var(--color-bvc-ink)]"
                />
                <span className="w-6 text-right font-bvc-mono text-[11px] font-semibold text-bvc-muted">
                  {setting.volume}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fallback nếu myLane được truyền */}
      {props.myLane}

      {/* Chú thích phòng thu */}
      <div className="flex shrink-0 items-center justify-between border-t border-bvc-border/70 pt-2 text-[11.5px] text-bvc-muted">
        <div className="flex items-center gap-1.5">
          <Headphones size={13} className="text-bvc-accent" />
          <span>Tắt tiếng (M) ưu tiên hơn Solo (S). Âm lượng chỉnh chỉ áp dụng cho tai nghe kiểm âm.</span>
        </div>
        <span className="hidden font-bvc-mono text-[11px] text-bvc-faint sm:inline">
          {formatClock(durationSec)} tổng thời lượng
        </span>
      </div>
    </section>
  );
}

