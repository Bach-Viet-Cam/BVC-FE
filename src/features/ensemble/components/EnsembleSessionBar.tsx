import { Check, Loader2, RotateCcw } from "lucide-react";
import { type ListeningMode, type MicPermission, type PracticeStatus } from "@/features/ensemble/types/ensembleTypes";

interface EnsembleSessionBarProps {
  status: PracticeStatus;
  hasMic: boolean;
  micPermission: MicPermission;
  micError: string | null;
  listeningMode: ListeningMode | null;
  headphoneLabel: string | null;
  isCountInOn: boolean;
  onCountInChange: (checked: boolean) => void;
  onChangeListeningMode: () => void;
  onRequestMicAccess: () => void;
  uploadPercent: number;
  onPracticeAgain: () => void;
  onBack: () => void;
  backLabel: string;
}

function MicAlert({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-lg bg-bvc-accent-tint p-2.5 text-[12.5px] text-bvc-accent-text sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onAction}
        className="min-h-9 shrink-0 cursor-pointer rounded-full bg-bvc-ink px-3 text-[12px] font-semibold text-white hover:opacity-90"
      >
        {action}
      </button>
    </div>
  );
}

/** Phần điều khiển riêng của hòa tấu nằm quanh `RecordPanel`: cách nghe, đếm nhịp, cảnh báo micro, tiến trình nộp. */
export function EnsembleSessionBar(props: EnsembleSessionBarProps) {
  const { status } = props;
  const isLive = status === "countIn" || status === "recording";

  return (
    <div className="flex min-w-0 flex-col gap-3 empty:hidden">
      {/* {isReady && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={props.onChangeListeningMode}
            disabled={props.micPermission !== "granted"}
            title={props.headphoneLabel ?? undefined}
            className={`${CHIP} max-w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {props.listeningMode === "speaker" ? (
              <Speaker size={16} className="shrink-0" aria-hidden />
            ) : (
              <Headphones size={16} className="shrink-0" aria-hidden />
            )}
            <span className="truncate">
              {props.listeningMode === "speaker"
                ? "Loa ngoài"
                : props.listeningMode === "headphones"
                  ? `Tai nghe${props.headphoneLabel ? ` · ${props.headphoneLabel}` : ""}`
                  : "Chọn cách nghe"}
            </span>
          </button>
        </div>
      )} */}

      {(status === "processing" || status === "saving") && (
        <div
          role="status"
          className="flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-bvc-border bg-bvc-surface text-[13.5px] font-medium text-bvc-ink"
        >
          <Loader2 size={18} className="animate-spin text-bvc-accent" aria-hidden />
          <span>
            {status === "saving"
              ? props.uploadPercent < 100
                ? `Đang tải lên ${props.uploadPercent}%...`
                : "Đang nộp..."
              : "Đang xử lý sóng âm..."}
          </span>
        </div>
      )}

      {status === "saved" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={props.onPracticeAgain}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-bvc-border bg-white text-[14px] font-medium text-bvc-ink hover:bg-bvc-surface"
          >
            <RotateCcw size={16} aria-hidden />
            Luyện lại
          </button>
          <button
            type="button"
            onClick={props.onBack}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-bvc-ink text-[14px] font-medium text-white"
          >
            <Check size={17} strokeWidth={2.4} aria-hidden />
            {props.backLabel}
          </button>
        </div>
      )}

      {!props.hasMic && (
        <MicAlert
          message="Không tìm thấy micro trên thiết bị. Vui lòng kết nối micro hoặc tai nghe có mic để bắt đầu thu bè."
          action="Dò lại micro"
          onAction={props.onRequestMicAccess}
        />
      )}
      {props.hasMic && props.micPermission === "denied" && (
        <MicAlert
          message="Chưa có quyền micro. Nếu trình duyệt không hỏi lại, hãy bấm biểu tượng ổ khóa cạnh thanh địa chỉ, cho phép micro rồi tải lại trang."
          action="Cấp quyền micro"
          onAction={props.onRequestMicAccess}
        />
      )}
      {props.micPermission !== "denied" && props.micError && (
        <p role="alert" className="rounded-lg bg-bvc-accent-tint p-2 text-[12px] font-medium text-bvc-accent-text">
          {props.micError}
        </p>
      )}

      {props.listeningMode === "speaker" && isLive && (
        <p className="text-[12px] text-bvc-muted">
          Đang dùng loa ngoài · đã bật khử vọng, bản thu có thể lẫn một phần tiếng bè.
        </p>
      )}
    </div>
  );
}
