import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Mic, Square } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";
import { Switch } from "@/shared/components/ui/switch";
import { MixerSheet } from "@/features/ensemble/components/MixerSheet";
import { useEnsemblePractice } from "@/features/ensemble/hooks/useEnsemblePractice";

const LEAVE_CONFIRM_MESSAGE = "Rời màn hình sẽ hủy bản thu đang thực hiện. Bạn có muốn rời đi?";

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bvc-line py-[11px] text-[14px] last:border-0">
      <span className="text-bvc-muted">{label}</span>
      <span className="text-right font-semibold text-bvc-ink">{value}</span>
    </div>
  );
}

export function EnsemblePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pieceId = searchParams.get("pieceId") ?? "";
  const assignmentId = searchParams.get("assignmentId") ?? undefined;
  const practice = useEnsemblePractice(pieceId, assignmentId);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const { status, cancel } = practice;
  const isBusy = status === "countIn" || status === "recording" || status === "saving";

  useEffect(() => {
    if (!isBusy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isBusy]);

  const leave = () => {
    if (isBusy && !window.confirm(LEAVE_CONFIRM_MESSAGE)) return;
    cancel();
    navigate(assignmentId ? `/assignment/${assignmentId}` : "/assignments");
  };

  const { tracksResult, isLoading, error } = practice;
  if (isLoading || !tracksResult) {
    return (
      <>
        <MobileHeader title="Luyện hòa tấu" onBack={leave} />
        <p className={`px-[14px] text-[14px] ${error ? "text-bvc-error" : "text-bvc-muted"}`}>
          {isLoading ? "Đang tải..." : error}
        </p>
      </>
    );
  }

  const progress = practice.durationSec > 0 ? Math.min(100, (practice.elapsedSec / practice.durationSec) * 100) : 0;
  const isRecording = status === "recording";

  return (
    <>
      <MobileHeader title="Luyện hòa tấu" subtitle={tracksResult?.pieceTitle} variant="close" onBack={leave} />

      <div className="flex-1 overflow-y-auto px-[14px] pb-4">
        <div className="mt-2 rounded-[20px] border border-bvc-border px-[16px] py-[4px]">
          <InfoRow label="Bài" value={tracksResult.pieceTitle} />
          <InfoRow label="Bè của tôi" value={tracksResult.myInstrumentName} />
          <InfoRow label="BPM mục tiêu" value={String(tracksResult.targetBpm)} />
        </div>

        <div className="mt-3 rounded-[20px] border border-bvc-border p-[16px]">
          <div className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-[8px] font-semibold text-bvc-ink">
              <span className={`size-[8px] rounded-full ${isRecording ? "bg-bvc-error" : "bg-bvc-bar-strong"}`} />
              {status === "countIn" && "Đang đếm nhịp vào..."}
              {status === "recording" && "Đang thu bè của bạn"}
              {status === "saving" && "Đang lưu bản thu..."}
              {status === "saved" && "Đã lưu bản thu"}
              {status === "ready" && "Sẵn sàng"}
            </span>
            <span className="font-mono text-bvc-muted">
              {formatClock(practice.elapsedSec)} / {formatClock(practice.durationSec)}
            </span>
          </div>
          <div className="mt-3 h-[8px] overflow-hidden rounded-full bg-bvc-bar">
            <div className="h-full rounded-full bg-bvc-accent" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-[12.5px] text-bvc-muted">
            {practice.tracks.length} bè ảo đang phát cùng bạn:{" "}
            {practice.tracks.map((track) => track.instrumentName).join(", ")}
          </p>
        </div>

        {practice.micError && (
          <p className="mt-3 rounded-[14px] bg-bvc-accent-tint px-[12px] py-[9px] text-[13.5px] text-bvc-accent-text">
            {practice.micError}
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-[10px]">
          <label className="flex items-center justify-between gap-2 rounded-[16px] border border-bvc-border p-[13px] text-[14px] font-semibold text-bvc-ink">
            Đếm nhịp vào
            <Switch
              checked={practice.isCountInOn}
              onCheckedChange={practice.setIsCountInOn}
              disabled={status !== "ready"}
            />
          </label>
          <label className="flex items-center justify-between gap-2 rounded-[16px] border border-bvc-border p-[13px] text-[14px] font-semibold text-bvc-ink">
            Metronome
            <Switch checked={practice.isMetronomeOn} onCheckedChange={practice.setIsMetronomeOn} />
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIsMixerOpen(true)}
          className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-[16px] border border-bvc-border p-[14px] text-left"
        >
          <span className="flex flex-col">
            <span className="text-[14.5px] font-bold text-bvc-ink">Bộ trộn âm</span>
            <span className="text-[12.5px] text-bvc-muted">Tắt, solo, chỉnh âm lượng từng bè</span>
          </span>
          <ChevronRight size={18} className="text-bvc-muted" />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-[8px] px-[14px] pb-5 pt-3">
        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={() => void practice.start()}
            disabled={status !== "ready"}
            className="flex h-[54px] flex-1 cursor-pointer items-center justify-center gap-[8px] rounded-[16px] border border-bvc-border-strong bg-white text-[15px] font-semibold text-bvc-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic size={18} />
            Bắt đầu
          </button>
          <button
            type="button"
            onClick={() => void practice.stop()}
            disabled={status !== "recording"}
            className="flex h-[54px] flex-1 cursor-pointer items-center justify-center gap-[8px] rounded-[16px] bg-bvc-ink text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Square size={16} />
            Dừng
          </button>
        </div>
        {status === "saved" ? (
          <button
            type="button"
            onClick={practice.reset}
            className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
          >
            Luyện lại
          </button>
        ) : (
          <p className="text-center text-[12px] text-bvc-muted">Dừng để lưu bản thu của bạn.</p>
        )}
      </div>

      <MixerSheet
        isOpen={isMixerOpen}
        onOpenChange={setIsMixerOpen}
        tracks={practice.tracks}
        settings={practice.mixer.settings}
        myInstrumentName={tracksResult.myInstrumentName}
        onVolumeChange={practice.mixer.setVolume}
        onToggleMute={practice.mixer.toggleMute}
        onToggleSolo={practice.mixer.toggleSolo}
        onReset={practice.mixer.reset}
      />
    </>
  );
}
