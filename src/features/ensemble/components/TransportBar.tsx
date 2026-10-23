import { useEffect, useState } from "react";
import { Check, Headphones, Loader2, Mic, RotateCcw, Sparkles, Speaker, Square } from "lucide-react";
import { type ListeningMode, type MicPermission, type PracticeStatus } from "@/features/ensemble/types/ensembleTypes";
import { formatClock } from "@/features/ensemble/utils/formatClock";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/utils/cn";

const COUNT_IN_BEATS = 4;

const STATUS_CONFIG: Record<PracticeStatus, { label: string; dot: string; textColor: string }> = {
  ready: { label: "Sẵn sàng thu", dot: "bg-bvc-ok", textColor: "text-bvc-ok" },
  countIn: { label: "Đang đếm nhịp vào...", dot: "bg-bvc-accent animate-pulse", textColor: "text-bvc-accent-text" },
  recording: { label: "Đang hòa tấu trực tiếp", dot: "bg-bvc-error animate-ping", textColor: "text-bvc-error" },
  processing: {
    label: "Đang xử lý âm thanh...",
    dot: "bg-bvc-accent animate-pulse",
    textColor: "text-bvc-accent-text",
  },
  preview: { label: "Nghe lại rồi nộp bản thu", dot: "bg-bvc-ok", textColor: "text-bvc-ok" },
  saving: { label: "Đang tải lên và nộp bài...", dot: "bg-bvc-ink animate-pulse", textColor: "text-bvc-ink" },
  saved: { label: "Đã nộp bản thu", dot: "bg-bvc-ok", textColor: "text-bvc-ok" },
};

interface TransportBarProps {
  status: PracticeStatus;
  countBeat: number;
  elapsedSec: number;
  durationSec: number;
  takeDurationSec: number | null;
  targetBpm: number;
  recordingStartedAt: number | null;
  myInstrumentName: string;
  micError: string | null;
  isCountInOn: boolean;
  onCountInChange: (checked: boolean) => void;
  hasMic: boolean;
  listeningMode: ListeningMode | null;
  headphoneLabel: string | null;
  micPermission: MicPermission;
  onChangeListeningMode: () => void;
  onRequestMicAccess: () => void;
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  onDiscard: () => void;
  onPracticeAgain: () => void;
  onBack: () => void;
  backLabel: string;
  uploadPercent: number;
  submitBlockedReason: string | null;
}

export function TransportBar(props: TransportBarProps) {
  const { status, countBeat } = props;
  const hasTake = status === "preview" || status === "saving" || status === "saved";
  const shownSec = hasTake && props.takeDurationSec !== null ? props.takeDurationSec : props.elapsedSec;
  const config = STATUS_CONFIG[status];

  // Tính nhịp phách chính xác theo thời gian thực (tránh lỗi lấy số nguyên giây gây nhảy cóc 1 -> 2 -> 4)
  const [recordingBeat, setRecordingBeat] = useState(0);

  useEffect(() => {
    if (status !== "recording" || !props.recordingStartedAt || props.targetBpm <= 0) {
      return;
    }
    const beatMs = 60000 / props.targetBpm;
    const tick = () => {
      const elapsedMs = Math.max(0, Date.now() - (props.recordingStartedAt ?? Date.now()));
      const currentBeat = Math.floor(elapsedMs / beatMs) % COUNT_IN_BEATS;
      setRecordingBeat(currentBeat);
    };

    tick();
    const timerId = window.setInterval(tick, 30);
    return () => window.clearInterval(timerId);
  }, [status, props.recordingStartedAt, props.targetBpm]);

  const activeBeat = status === "countIn" ? countBeat : status === "recording" ? recordingBeat : -1;

  return (
    <section
      aria-label="Bàn điều khiển thu âm"
      className="flex shrink-0 flex-col gap-3 rounded-lg border border-bvc-border bg-gradient-to-b from-white via-white to-bvc-surface/30 p-3.5 shadow-sm md:p-4"
    >
      {/* Hàng 1: Đồng hồ số lớn & Đèn LED phách + Công tắc đếm nhịp */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bvc-mono text-[30px] font-black tracking-tight text-bvc-ink md:text-[34px]">
              {formatClock(shownSec)}
            </span>
            <span className="font-bvc-mono text-[18px] font-semibold text-bvc-faint md:text-[20px]">
              / {formatClock(props.durationSec)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[12px]">
            <span className={cn("size-2 shrink-0 rounded-full", config.dot)} />
            <span className={cn("truncate font-bold", config.textColor)}>{config.label}</span>
            <span className="font-bvc-mono text-bvc-muted">· {props.targetBpm} BPM</span>
          </div>
        </div>

        {/* Cụm Đếm 4 nhịp & 4 Đèn LED nhịp phách đặt cùng 1 hàng */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold tracking-wider text-bvc-faint uppercase">Nhịp phách</span>
          <div className="flex items-center gap-2">
            {!hasTake && (
              <>
                <button
                  type="button"
                  onClick={props.onChangeListeningMode}
                  disabled={status !== "ready" || props.micPermission !== "granted"}
                  title={props.headphoneLabel ?? undefined}
                  className="flex h-6.5 max-w-44 cursor-pointer items-center gap-1.5 rounded-md border border-bvc-border bg-bvc-surface/50 px-2 text-[11px] font-bold text-bvc-ink transition-colors hover:bg-bvc-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {props.listeningMode === "speaker" ? (
                    <Speaker size={13} className="shrink-0" />
                  ) : (
                    <Headphones size={13} className="shrink-0" />
                  )}
                  <span className="truncate">
                    {props.listeningMode === "speaker"
                      ? "Loa ngoài"
                      : props.listeningMode === "headphones"
                        ? `Tai nghe${props.headphoneLabel ? ` · ${props.headphoneLabel}` : ""}`
                        : "Chọn cách nghe"}
                  </span>
                </button>

                <label className="flex h-6.5 cursor-pointer items-center gap-1.5 rounded-md border border-bvc-border bg-bvc-surface/50 px-2 text-[11px] font-bold text-bvc-ink transition-colors hover:bg-bvc-surface">
                  <span className="whitespace-nowrap">Đếm 4 nhịp</span>
                  <Switch
                    size="sm"
                    checked={props.isCountInOn}
                    onCheckedChange={props.onCountInChange}
                    disabled={status !== "ready"}
                  />
                </label>
              </>
            )}

            <div className="flex items-center gap-1" aria-hidden>
              {Array.from({ length: COUNT_IN_BEATS }).map((_, index) => {
                const isActive = activeBeat === index;
                const isDownbeat = index === 0;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex size-6.5 items-center justify-center rounded-md font-bvc-mono text-[11px] font-black transition-all",
                      isActive
                        ? isDownbeat
                          ? "scale-110 bg-bvc-ink text-white shadow-sm ring-2 ring-bvc-ink/30"
                          : "scale-110 bg-bvc-accent text-white shadow-sm ring-2 ring-bvc-accent/30"
                        : "border border-bvc-border bg-bvc-surface/60 text-bvc-faint"
                    )}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hàng 2: Nút hành động chính chuẩn DAW */}
      <div className="flex flex-col gap-2">
        {status === "ready" && (
          <button
            type="button"
            onClick={props.onStart}
            disabled={props.micPermission === "pending" || !props.hasMic}
            aria-disabled={props.micPermission === "pending" || !props.hasMic}
            className="flex h-11.5 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-bvc-accent font-bold text-[14px] text-white shadow-sm transition-all hover:bg-bvc-ink active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic size={18} strokeWidth={2.4} />
            <span>Bắt đầu thu bè {props.myInstrumentName}</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10.5px] font-semibold text-white/90">
              Phím Space
            </span>
          </button>
        )}

        {status === "countIn" && (
          <div className="flex h-11.5 w-full items-center justify-center gap-3 rounded-xl bg-bvc-accent font-bvc-mono text-[15px] font-extrabold text-white shadow-md animate-pulse">
            <span>Chuẩn bị vào bè: Phách {countBeat + 1} / 4</span>
          </div>
        )}

        {status === "recording" && (
          <button
            type="button"
            onClick={props.onStop}
            className="flex h-11.5 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-bvc-error font-bold text-[14px] text-white shadow-md transition-all hover:bg-red-700 active:scale-[0.99]"
          >
            <Square size={16} fill="currentColor" strokeWidth={0} />
            <span>Dừng thu âm</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10.5px] font-semibold text-white/90">
              Phím Space
            </span>
          </button>
        )}

        {(status === "processing" || status === "saving") && (
          <div className="flex h-11.5 w-full items-center justify-center gap-2.5 rounded-xl border border-bvc-border bg-bvc-surface text-[13.5px] font-semibold text-bvc-ink">
            <Loader2 size={18} className="animate-spin text-bvc-accent" />
            <span>
              {status === "saving"
                ? props.uploadPercent < 100
                  ? `Đang tải lên ${props.uploadPercent}%...`
                  : "Đang nộp..."
                : "Đang xử lý sóng âm..."}
            </span>
          </div>
        )}

        {status === "preview" && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={props.onDiscard}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-bvc-border bg-white text-[13.5px] font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface active:scale-[0.99]"
              >
                <RotateCcw size={16} strokeWidth={2} />
                <span>Thu lại (R)</span>
              </button>
              <button
                type="button"
                onClick={props.onSubmit}
                disabled={props.submitBlockedReason !== null}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-ink text-[13.5px] font-bold text-white shadow-md transition-all hover:bg-emerald-950 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={16} strokeWidth={2} />
                <span>Nộp bản thu (S)</span>
              </button>
            </div>
            {props.submitBlockedReason !== null && (
              <p className="text-[12px] text-bvc-accent-text">{props.submitBlockedReason}</p>
            )}
          </div>
        )}

        {status === "saved" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={props.onPracticeAgain}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-bvc-border bg-white text-[13.5px] font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface"
            >
              <RotateCcw size={16} />
              <span>Luyện lại</span>
            </button>
            <button
              type="button"
              onClick={props.onBack}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-bvc-ink text-[13.5px] font-bold text-white shadow-md hover:bg-emerald-950"
            >
              <Check size={17} strokeWidth={2.4} />
              <span>{props.backLabel}</span>
            </button>
          </div>
        )}
      </div>

      {!props.hasMic && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg bg-bvc-accent-tint p-2.5 text-[12.5px] text-bvc-accent-text sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Không tìm thấy micro trên thiết bị. Vui lòng kết nối micro hoặc tai nghe có mic để bắt đầu thu bè.</span>
          <button
            type="button"
            onClick={props.onRequestMicAccess}
            className="h-8 shrink-0 cursor-pointer rounded-md bg-bvc-ink px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Dò lại micro
          </button>
        </div>
      )}

      {props.hasMic && props.micPermission === "denied" && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg bg-bvc-accent-tint p-2.5 text-[12.5px] text-bvc-accent-text sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            Chưa có quyền micro. Nếu trình duyệt không hỏi lại, hãy bấm biểu tượng ổ khóa cạnh thanh địa chỉ, cho phép
            micro rồi tải lại trang.
          </span>
          <button
            type="button"
            onClick={props.onRequestMicAccess}
            className="h-8 shrink-0 cursor-pointer rounded-md bg-bvc-ink px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Cấp quyền micro
          </button>
        </div>
      )}

      {props.micPermission !== "denied" && props.micError && (
        <p role="alert" className="rounded-lg bg-bvc-accent-tint p-2 text-[12px] font-medium text-bvc-accent-text">
          {props.micError}
        </p>
      )}

      {props.listeningMode === "speaker" && (status === "countIn" || status === "recording") && (
        <p className="text-[12px] text-bvc-muted">
          Đang dùng loa ngoài · đã bật khử vọng, bản thu có thể lẫn một phần tiếng bè.
        </p>
      )}
    </section>
  );
}
