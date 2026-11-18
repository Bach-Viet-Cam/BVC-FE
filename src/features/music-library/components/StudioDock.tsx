import { Check, Pause, Play, TriangleAlert } from "lucide-react";
import { ListeningModeToggle } from "@/features/music-library/components/ListeningModeToggle";
import { RecordButton } from "@/features/practice/components/RecordButton";
import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { type RecordState } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

interface StudioDockProps {
  rec: RecordState;
  maxSeconds: number;
  liveSeconds: number;
  countBeat: number;
  isCountInOn: boolean;
  listeningMode: ListeningMode;
  takeSeconds: number;
  takePositionSec: number;
  isTakePlaying: boolean;
  error: string;
  micDenied: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancelCount: () => void;
  onModeChange: (mode: ListeningMode) => void;
  onCountInChange: (isOn: boolean) => void;
  onToggleTake: () => void;
  onDiscard: () => void;
  onUse: () => void;
}

function Alert({ message, micDenied }: { message: string; micDenied: boolean }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl bg-bvc-accent-tint px-3.5 py-2.5 text-[13px] leading-snug text-bvc-accent-text"
    >
      <TriangleAlert size={17} className="mt-px shrink-0" aria-hidden />
      <span>
        {message}
        {micDenied && " Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, cho phép micro rồi thử lại."}
      </span>
    </div>
  );
}

function CountInSwitch({ isOn, onChange }: { isOn: boolean; onChange: (isOn: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => onChange(!isOn)}
      className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl bg-bvc-soft px-4 text-[14px] font-medium text-bvc-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-accent"
    >
      Đếm nhịp trước khi thu
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          isOn ? "bg-bvc-accent" : "bg-bvc-bar-strong"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform duration-200",
            isOn && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}

function IdlePanel(props: StudioDockProps) {
  const isSpeaker = props.listeningMode === "speaker";
  return (
    <>
      <RecordButton variant="record" onClick={props.onStart} />
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-[16px] font-semibold text-bvc-ink">Sẵn sàng ghi âm</span>
        <span className="text-[13px] leading-snug text-bvc-muted">
          {isSpeaker ? "Nên dùng tai nghe để bản thu không lẫn tiếng các bè." : "Chạm nút để bắt đầu."}
        </span>
      </div>
      <div className="flex w-full flex-col gap-2">
        <ListeningModeToggle value={props.listeningMode} onChange={props.onModeChange} />
        <CountInSwitch isOn={props.isCountInOn} onChange={props.onCountInChange} />
      </div>
    </>
  );
}

function CountInPanel(props: StudioDockProps) {
  return (
    <>
      <RecordButton variant="count" countNumber={props.countBeat + 1} />
      <span className="text-[16px] font-semibold text-bvc-ink">Đếm nhịp...</span>
      <button
        type="button"
        onClick={props.onCancelCount}
        className="min-h-11 w-full cursor-pointer rounded-full border border-bvc-border-strong px-5 text-[14px] font-medium text-bvc-ink transition-colors hover:bg-bvc-surface"
      >
        Hủy
      </button>
    </>
  );
}

function RecordingPanel(props: StudioDockProps) {
  return (
    <>
      <RecordButton variant="stop" onClick={props.onStop} />
      <div className="flex flex-col items-center gap-1.5">
        <span className="flex items-center gap-2 text-[14px] font-semibold text-bvc-ink">
          <span className="size-2.5 animate-pulse rounded-full bg-bvc-error" aria-hidden />
          Đang ghi
        </span>
        <span className="font-bvc-mono text-[30px] leading-none font-semibold text-bvc-ink tabular-nums">
          {formatClock(props.liveSeconds)}
          <span className="text-[13px] font-normal text-bvc-muted"> / {formatClock(props.maxSeconds)}</span>
        </span>
      </div>
    </>
  );
}

function ReviewPanel(props: StudioDockProps) {
  return (
    <>
      <button
        type="button"
        onClick={props.onToggleTake}
        aria-label={props.isTakePlaying ? "Tạm dừng bản thu" : "Nghe lại bản thu"}
        className="flex size-[84px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-ink text-white transition-transform active:scale-95"
      >
        {props.isTakePlaying ? (
          <Pause size={30} fill="currentColor" strokeWidth={0} aria-hidden />
        ) : (
          <Play size={30} fill="currentColor" strokeWidth={0} className="translate-x-0.5" aria-hidden />
        )}
      </button>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[16px] font-semibold text-bvc-ink">Nghe lại bản thu</span>
        <span className="font-bvc-mono text-[13px] text-bvc-muted tabular-nums">
          {formatClock(props.takePositionSec)} / {formatClock(props.takeSeconds)}
        </span>
      </div>
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={props.onUse}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-bvc-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-bvc-ink"
        >
          <Check size={18} strokeWidth={2.4} aria-hidden />
          Dùng bản thu này
        </button>
        <button
          type="button"
          onClick={props.onDiscard}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong px-5 text-[15px] font-medium text-bvc-ink transition-colors hover:bg-bvc-surface"
        >
          Thu lại
        </button>
      </div>
    </>
  );
}

// Thẻ thu âm: nút chính nằm giữa và đổi theo trạng thái (chờ ghi, đếm nhịp, đang ghi, nghe lại).
export function StudioDock(props: StudioDockProps) {
  return (
    <section
      aria-label="Thu bè của bạn"
      className="flex flex-col items-center gap-4 rounded-[26px] border border-bvc-border bg-white p-4 sm:p-5"
    >
      {props.error && <Alert message={props.error} micDenied={props.micDenied} />}
      {props.rec === "countin" ? (
        <CountInPanel {...props} />
      ) : props.rec === "recording" ? (
        <RecordingPanel {...props} />
      ) : props.rec === "preview" ? (
        <ReviewPanel {...props} />
      ) : (
        <IdlePanel {...props} />
      )}
    </section>
  );
}
