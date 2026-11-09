import { type KeyboardEvent, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { type EnsembleTrack, type TrackSetting } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { getTrackTheme, TAKE_THEME, type TrackTheme } from "@/features/ensemble/utils/trackTheme";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Slider } from "@/shared/components/ui/slider";
import { cn } from "@/shared/utils/cn";

/** Tỉ lệ tối thiểu: 14 px / giây. Khung rộng hơn nhu cầu thì giãn ra cho vừa khít. */
const BASE_PPS = 14;
/** Lề phải khi timeline được giãn vừa khít khung. */
const TAIL = 12;
/** Khoảng trống bên trái mốc 0:00. */
const LEAD = 12;
const ROW_H = 56;

/** Tên ngắn cho cột nhãn: bỏ tiền tố "Đàn". */
function shortName(name: string): string {
  const short = name.replace(/^đàn\s+/i, "").trim();
  return short ? short.charAt(0).toUpperCase() + short.slice(1) : name;
}
const WAVE_MID = ROW_H / 2;
const WAVE_MAX = 22;
const DRAG_THRESHOLD_PX = 5;
const KEY_SEEK_SEC = 5;

/** Bản thu của người học, hiện như một làn riêng ở cuối. Âm lượng 0-100. */
export interface TimelineTake {
  peaks: number[];
  durationSec: number;
  volume: number;
  muted: boolean;
}

interface WaveformTimelineProps {
  take?: TimelineTake | null;
  onTakeVolumeChange?: (volume: number) => void;
  onToggleTakeMute?: () => void;
  tracks: EnsembleTrack[];
  settings: TrackSetting[];
  anySolo: boolean;
  peaksByTrack: ReadonlyMap<string, number[]>;
  durationSec: number;
  positionSec: number;
  myInstrumentId?: string;
  isRecording?: boolean;
  disabled?: boolean;
  onToggleMute: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onSeek?: (seconds: number) => void;
}

function wavePath(peaks: number[], widthPx: number): string {
  if (peaks.length === 0) return "";
  const pitch = widthPx / peaks.length;
  let d = "";
  peaks.forEach((peak, index) => {
    const h = Math.max(1.1, Math.pow(Math.min(1, peak), 0.75) * WAVE_MAX);
    const x = (index * pitch + pitch / 2).toFixed(1);
    d += `M${x} ${(WAVE_MID - h).toFixed(1)}V${(WAVE_MID + h).toFixed(1)}`;
  });
  return d;
}

interface WaveRowProps {
  peaks: number[];
  theme: TrackTheme;
  offsetPx: number;
  widthPx: number;
  rowWidthPx: number;
  playedPx: number;
  isOwn: boolean;
  isSilenced: boolean;
  /** Bè không phải bè đang tập: nền nhạt hơn để bè của bạn nổi bật. */
  isDimmed?: boolean;
}

function WaveRow({ peaks, theme, offsetPx, widthPx, rowWidthPx, playedPx, isOwn, isSilenced, isDimmed }: WaveRowProps) {
  const d = useMemo(() => wavePath(peaks, widthPx), [peaks, widthPx]);
  const svg = (color: string) => (
    <svg width={rowWidthPx} height={ROW_H} className="absolute top-0 left-0" aria-hidden>
      {d ? (
        <path
          d={d}
          transform={`translate(${offsetPx} 0)`}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <line x1={offsetPx} x2={offsetPx + widthPx} y1={WAVE_MID} y2={WAVE_MID} stroke={color} strokeWidth={1} />
      )}
    </svg>
  );
  return (
    <div
      className={cn(
        "relative mb-1.5 ml-3 h-14 overflow-hidden rounded-xl",
        isOwn && "shadow-[inset_0_0_0_1.5px_var(--color-bvc-gold)]",
        isSilenced && "opacity-55"
      )}
      style={{
        width: rowWidthPx,
        background: isDimmed ? `color-mix(in srgb, ${theme.bg} 45%, white)` : theme.bg,
      }}
    >
      {svg(theme.light)}
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: playedPx }}>
        {svg(theme.dark)}
      </div>
    </div>
  );
}

export function WaveformTimeline(props: WaveformTimelineProps) {
  const { tracks, settings, durationSec, positionSec, disabled, onSeek } = props;
  const canSeek = Boolean(onSeek) && !disabled;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewW, setViewW] = useState(320);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setViewW(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [dragSec, setDragSec] = useState<number | null>(null);
  const gesture = useRef<{ x: number; from: number; moved: boolean } | null>(null);
  const shownSec = Math.max(0, Math.min(durationSec, dragSec ?? positionSec));

  // Bài đủ ngắn để nằm gọn trong khung ở tỉ lệ cơ bản thì giãn ra lấp đầy khung (không cần cuộn).
  const fitPps = durationSec > 0 ? (viewW - LEAD - TAIL) / durationSec : BASE_PPS;
  const fits = fitPps >= BASE_PPS;
  const pps = fits ? fitPps : BASE_PPS;
  const widthPx = durationSec * pps;
  const contentW = fits ? viewW : Math.round(LEAD + widthPx + Math.max(LEAD, viewW / 2));
  const playheadPx = LEAD + shownSec * pps;
  const scrollX = fits ? 0 : Math.max(0, Math.min(contentW - viewW, playheadPx - viewW / 2));

  const ticks = useMemo(() => {
    const list: { t: number; major: boolean; minor: boolean }[] = [];
    for (let t = 0; t <= durationSec; t += 1) list.push({ t, major: t % 15 === 0, minor: t % 5 === 0 });
    return list;
  }, [durationSec]);

  const clampSec = (value: number) => Math.max(0, Math.min(durationSec, value));

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!canSeek) return;
    gesture.current = { x: event.clientX, from: positionSec, moved: false };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* bỏ qua */
    }
  };
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = event.clientX - g.x;
    if (!g.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    g.moved = true;
    setDragSec(clampSec(g.from - dx / pps));
  };
  const handleUp = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.moved) {
      const target = clampSec(g.from - (event.clientX - g.x) / pps);
      setDragSec(null);
      onSeek?.(target);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    onSeek?.(clampSec((event.clientX - rect.left - LEAD) / pps));
  };
  const handleCancel = () => {
    gesture.current = null;
    setDragSec(null);
  };
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canSeek) return;
    if (event.key === "ArrowLeft") onSeek?.(clampSec(positionSec - KEY_SEEK_SEC));
    else if (event.key === "ArrowRight") onSeek?.(clampSec(positionSec + KEY_SEEK_SEC));
    else return;
    event.preventDefault();
  };

  return (
    <div className="relative flex w-full min-w-0 overflow-hidden rounded-[18px] border border-[#e6dfc8] bg-[#faf8ef]">
      {/* Cột tên bè */}
      <div className="flex w-24 shrink-0 flex-col sm:w-28 bg-[#faf8ef]">
        <div className="h-8 shrink-0" />
        <div className="grow bg-[#375f0f] pt-[5px] pb-[3px]">
          {tracks.map((track) => {
            const setting = settings.find((item) => item.trackId === track.id);
            if (!setting) return null;
            const isOwn = track.instrumentId === props.myInstrumentId;
            const recordingOwn = Boolean(isOwn && props.isRecording);
            const silenced = setting.isMuted || (props.anySolo && !setting.isSolo) || recordingOwn;
            return (
              <div
                key={track.id}
                className={cn(
                  "mb-1.5 flex h-14 w-full items-center gap-1 border-t border-t-[#faf8ef]/10 px-1.5 text-white",
                  isOwn ? "bg-[#145b43] shadow-[inset_3px_0_0_var(--color-bvc-gold)]" : "bg-[#3f8069]"
                )}
              >
                <button
                  type="button"
                  aria-pressed={setting.isMuted}
                  aria-label={`${setting.isMuted ? "Bật" : "Tắt"} tiếng ${track.instrumentName}`}
                  disabled={recordingOwn}
                  onClick={() => props.onToggleMute(track.id)}
                  className={cn(
                    "flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1 border-0 bg-transparent pl-1 text-left text-white disabled:cursor-not-allowed",
                    silenced && "opacity-50"
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-px">
                    <span
                      className={cn("text-[12px] leading-tight font-semibold break-words", silenced && "line-through")}
                    >
                      {shortName(track.instrumentName)}
                    </span>
                    {isOwn && <span className="text-[10.5px] leading-tight font-bold text-[#e6d29a]">Bạn</span>}
                  </span>
                </button>
                <Popover>
                  <PopoverTrigger
                    aria-label={`Âm lượng ${track.instrumentName}: ${setting.volume}%`}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white outline-none hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#e6d29a] data-popup-open:bg-white/20"
                  >
                    {setting.volume === 0 ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
                  </PopoverTrigger>
                  <PopoverContent className="flex w-12 flex-col items-center gap-2 px-2 py-3">
                    <span className="text-[11px] font-semibold text-bvc-muted tabular-nums">{setting.volume}%</span>
                    <Slider
                      orientation="vertical"
                      min={0}
                      max={100}
                      value={setting.volume}
                      onValueChange={(value) => props.onVolumeChange(track.id, value as number)}
                      aria-label={`Âm lượng ${track.instrumentName}`}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
          {props.take && (
            <div className="mb-1.5 flex h-14 w-full items-center gap-1 border-t border-t-[#faf8ef]/10 px-1.5 text-white shadow-[inset_3px_0_0_var(--color-bvc-gold)] bg-[#145b43]">
              <button
                type="button"
                aria-pressed={props.take.muted}
                aria-label={`${props.take.muted ? "Bật" : "Tắt"} tiếng bản thu của bạn`}
                onClick={props.onToggleTakeMute}
                className={cn(
                  "flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1 border-0 bg-transparent pl-1 text-left text-white",
                  props.take.muted && "opacity-50"
                )}
              >
                <span className="flex min-w-0 flex-col gap-px">
                  <span className={cn("text-[12px] leading-tight font-semibold", props.take.muted && "line-through")}>
                    Bản thu
                  </span>
                </span>
              </button>
              <Popover>
                <PopoverTrigger
                  aria-label={`Âm lượng bản thu: ${props.take.volume}%`}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white outline-none hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#e6d29a] data-popup-open:bg-white/20"
                >
                  {props.take.volume === 0 ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
                </PopoverTrigger>
                <PopoverContent className="flex w-12 flex-col items-center gap-2 px-2 py-3">
                  <span className="text-[11px] font-semibold text-bvc-muted tabular-nums">{props.take.volume}%</span>
                  <Slider
                    orientation="vertical"
                    min={0}
                    max={100}
                    value={props.take.volume}
                    onValueChange={(value) => props.onTakeVolumeChange?.(value as number)}
                    aria-label="Âm lượng bản thu"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Vùng timeline: nội dung trượt, playhead luôn ở giữa */}
      <div ref={scrollRef} className="relative min-w-0 grow overflow-hidden">
        <div
          role="slider"
          tabIndex={canSeek ? 0 : -1}
          aria-label="Vị trí phát các bè"
          aria-valuemin={0}
          aria-valuemax={durationSec}
          aria-valuenow={Math.round(shownSec)}
          aria-valuetext={formatClock(shownSec)}
          aria-disabled={!canSeek}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleCancel}
          onKeyDown={handleKey}
          className={cn(
            "relative touch-none pt-[37px] pb-[3px] will-change-transform select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bvc-accent",
            canSeek ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          )}
          style={{ width: contentW, transform: `translateX(${-scrollX}px)` }}
        >
          {/* Thước thời gian */}
          <div
            className="absolute top-0 left-0 h-8 border-b border-[#e6dfc8] bg-[#faf8ef]"
            style={{ width: contentW }}
            aria-hidden
          >
            {ticks.map(({ t, major, minor }) => (
              <span
                key={t}
                className={cn(
                  "absolute bottom-0 w-px",
                  major ? "h-3 bg-[#7c8c82]" : minor ? "h-2 bg-[#b5c0b8]" : "h-1 bg-[#b5c0b8]"
                )}
                style={{ left: LEAD + t * pps }}
              />
            ))}
            {ticks
              .filter(({ major }) => major)
              .map(({ t }) => (
                <span
                  key={t}
                  className={cn(
                    "absolute top-[5px] font-mono text-[11px] font-semibold",
                    t === 0 ? "text-[#145b43]" : "text-bvc-muted"
                  )}
                  style={{ left: LEAD + t * pps + (t === 0 ? 5 : 4) }}
                >
                  {formatClock(t)}
                </span>
              ))}
          </div>

          {/* Waveform từng bè */}
          {tracks.map((track, index) => {
            const setting = settings.find((item) => item.trackId === track.id);
            if (!setting) return null;
            const isOwn = track.instrumentId === props.myInstrumentId;
            const silenced =
              setting.isMuted || (props.anySolo && !setting.isSolo) || Boolean(isOwn && props.isRecording);
            return (
              <WaveRow
                key={track.id}
                peaks={props.peaksByTrack.get(track.id) ?? []}
                theme={getTrackTheme(track.instrumentName, index)}
                offsetPx={(track.offsetMs / 1000) * pps}
                widthPx={track.durationSec * pps}
                rowWidthPx={widthPx}
                playedPx={Math.max(0, Math.min(widthPx, shownSec * pps))}
                isOwn={isOwn}
                isDimmed={!isOwn}
                isSilenced={silenced}
              />
            );
          })}

          {props.take && (
            <WaveRow
              peaks={props.take.peaks}
              theme={TAKE_THEME}
              offsetPx={0}
              widthPx={props.take.durationSec * pps}
              rowWidthPx={widthPx}
              playedPx={Math.max(0, Math.min(widthPx, shownSec * pps))}
              isOwn
              isSilenced={props.take.muted}
            />
          )}

          {/* Playhead */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-0.5 will-change-transform"
            style={{ transform: `translateX(${playheadPx - 1}px)` }}
          >
            <span className="absolute inset-y-0 left-0 w-0.5 rounded-[1px] bg-[#145b43] shadow-[0_0_0_1px_rgba(250,248,239,0.9)]" />
            <span className="absolute top-[9px] -left-[7px] box-border size-4 rounded-full border-2 border-[#faf8ef] bg-[#145b43] shadow-[0_1px_4px_rgba(20,91,67,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
