import { Music2 } from "lucide-react";
import { StudioLane } from "@/features/music-library/components/StudioLane";
import { StudioTakeLane } from "@/features/music-library/components/StudioTakeLane";
import { useElementWidth } from "@/features/music-library/hooks/useElementWidth";
import { useTimelineScrub } from "@/features/music-library/hooks/useTimelineScrub";
import { type StudioLaneModel, type StudioTakeLaneModel } from "@/features/music-library/hooks/useStudioTimeline";
import { pickRulerLabels, type RulerTick } from "@/features/music-library/utils/studioTimeline";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { cn } from "@/shared/utils/cn";

/** Chừa một mép phải để cột cuối của thước không dính khung. */
const EDGE_PAD_PX = 10;
const LABEL_CLEARANCE_PX = 56;
const LABEL_WIDTH_PX = 40;
const LABEL_MIN_GAP_PX = 64;

interface StudioTimelineProps {
  lanes: StudioLaneModel[];
  take: StudioTakeLaneModel;
  ticks: RulerTick[];
  spanSec: number;
  playheadSec: number;
  canSeek: boolean;
  isLoading: boolean;
  onSeek: (sec: number) => void;
  onLaneVolume: (laneId: string, volume: number) => void;
  onLaneMute: (laneId: string) => void;
  onTakeVolume: (volume: number) => void;
  onTakeMute: () => void;
}

function LaneSkeleton() {
  return (
    <div className="flex flex-col gap-1.5" role="status" aria-label="Đang tải các bè">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-[56px] rounded-2xl bg-bvc-surface motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

function NoPartsNote() {
  return (
    <p className="flex items-center gap-2.5 rounded-2xl border border-dashed border-bvc-border-strong bg-white px-4 py-3.5 text-[13px] text-bvc-muted">
      <Music2 size={18} className="shrink-0 text-bvc-faint" aria-hidden />
      Bài này chưa có bè nào để nghe cùng. Bạn sẽ thu bè đầu tiên.
    </p>
  );
}

// Dải timeline của phòng thu: thước thời gian, các bè có sẵn và làn bản thu của giảng viên dùng chung một đầu phát.
export function StudioTimeline(props: StudioTimelineProps) {
  const { lanes, take, ticks, spanSec, playheadSec, canSeek, isLoading } = props;
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const pxPerSec = width > EDGE_PAD_PX ? (width - EDGE_PAD_PX) / spanSec : 0;
  const scrub = useTimelineScrub({ pxPerSec, spanSec, canSeek, positionSec: playheadSec, onSeek: props.onSeek });
  const shownSec = Math.max(0, Math.min(spanSec, scrub.shownSec));
  const labelSecs =
    pxPerSec > 0
      ? pickRulerLabels(ticks, {
          pxPerSec,
          widthPx: width,
          playheadSec: shownSec,
          minGapPx: LABEL_MIN_GAP_PX,
          playheadClearPx: LABEL_CLEARANCE_PX,
          labelWidthPx: LABEL_WIDTH_PX,
        })
      : [];

  return (
    <section
      aria-label="Các bè và bản thu"
      className="relative flex flex-col gap-1.5 rounded-[22px] bg-bvc-soft p-2.5 [--label-w:120px] sm:p-3 sm:[--label-w:176px]"
    >
      <div className="flex h-8 items-end" aria-hidden>
        <span className="w-(--label-w) shrink-0" />
        <div className="relative h-full min-w-0 flex-1 border-b border-bvc-border-strong">
          {pxPerSec > 0 &&
            ticks.map(({ sec, major }) => (
              <span
                key={sec}
                className={cn("absolute bottom-0 w-px", major ? "h-3 bg-bvc-bar-strong" : "h-1.5 bg-bvc-bar")}
                style={{ left: sec * pxPerSec }}
              />
            ))}
          {labelSecs.map((sec) => (
            <span
              key={sec}
              className="absolute top-0 translate-x-1 font-bvc-mono text-[11px] font-medium text-bvc-muted tabular-nums"
              style={{ left: sec * pxPerSec }}
            >
              {formatClock(sec)}
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LaneSkeleton />
      ) : (
        <>
          {lanes.length === 0 && <NoPartsNote />}
          {lanes.map((lane) => (
            <StudioLane
              key={lane.id}
              lane={lane}
              pxPerSec={pxPerSec}
              playheadSec={shownSec}
              onVolumeChange={props.onLaneVolume}
              onToggleMute={props.onLaneMute}
            />
          ))}
        </>
      )}
      <StudioTakeLane
        take={take}
        pxPerSec={pxPerSec}
        playheadSec={shownSec}
        onVolumeChange={props.onTakeVolume}
        onToggleMute={props.onTakeMute}
      />

      {/* Lớp tua + đầu phát phủ lên đúng cột sóng, từ thước xuống hết làn cuối */}
      <div
        ref={ref}
        role="slider"
        tabIndex={canSeek ? 0 : -1}
        aria-label="Vị trí phát"
        aria-valuemin={0}
        aria-valuemax={Math.round(spanSec)}
        aria-valuenow={Math.round(shownSec)}
        aria-valuetext={formatClock(shownSec)}
        aria-disabled={!canSeek}
        {...scrub.handlers}
        className={cn(
          "absolute top-2.5 right-2.5 bottom-2.5 left-[calc(var(--label-w)+0.625rem)] z-10 touch-pan-y select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-accent sm:top-3 sm:right-3 sm:bottom-3 sm:left-[calc(var(--label-w)+0.75rem)]",
          canSeek ? "cursor-pointer" : "cursor-default"
        )}
      >
        {pxPerSec > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 will-change-transform"
            style={{ transform: `translateX(${shownSec * pxPerSec}px)` }}
          >
            <span className="absolute top-0 left-0 -translate-x-1/2 rounded-full bg-bvc-ink px-2 py-0.5 font-bvc-mono text-[11px] font-semibold text-white tabular-nums">
              {formatClock(shownSec)}
            </span>
            <span className="absolute top-[26px] bottom-0 left-0 w-0.5 -translate-x-1/2 rounded-full bg-bvc-ink shadow-[0_0_0_1.5px_rgb(255_255_255/0.85)]" />
          </div>
        )}
      </div>
    </section>
  );
}
