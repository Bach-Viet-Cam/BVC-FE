import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { type EnsembleTrack, type TrackSetting } from "@/features/ensemble/types/ensembleTypes";
import { cn } from "@/shared/utils/cn";

interface MixerSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tracks: EnsembleTrack[];
  settings: TrackSetting[];
  myInstrumentName: string;
  onVolumeChange: (trackId: string, volume: number) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onReset: () => void;
}

export function MixerSheet({
  isOpen,
  onOpenChange,
  tracks,
  settings,
  myInstrumentName,
  onVolumeChange,
  onToggleMute,
  onToggleSolo,
  onReset,
}: MixerSheetProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="top-auto bottom-0 max-w-[428px] -translate-y-0 rounded-b-none rounded-t-[24px] data-starting-style:translate-y-6 data-ending-style:translate-y-6">
        <DialogTitle>Bộ trộn âm</DialogTitle>
        <DialogDescription>
          Các bè ảo của bài · bè {myInstrumentName} là của bạn nên không nằm ở đây. Chỉnh âm chỉ ảnh hưởng đến âm nghe,
          không ảnh hưởng đến bản thu.
        </DialogDescription>
        <DialogClose />
        <div className="flex flex-col gap-3">
          {tracks.map((track) => {
            const setting = settings.find((item) => item.trackId === track.id);
            if (!setting) return null;
            return (
              <div key={track.id} className="flex flex-col gap-2 border-b border-outline-variant/30 pb-3 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-[15px] font-bold text-on-surface", setting.isMuted && "opacity-50")}>
                    {track.instrumentName}
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Tắt tiếng ${track.instrumentName}`}
                      aria-pressed={setting.isMuted}
                      onClick={() => onToggleMute(track.id)}
                      className={cn(
                        "size-[36px] cursor-pointer rounded-[10px] border text-[13px] font-bold",
                        setting.isMuted
                          ? "border-primary bg-primary text-white"
                          : "border-outline-variant bg-white text-on-surface-variant"
                      )}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      aria-label={`Solo ${track.instrumentName}`}
                      aria-pressed={setting.isSolo}
                      onClick={() => onToggleSolo(track.id)}
                      className={cn(
                        "size-[36px] cursor-pointer rounded-[10px] border text-[13px] font-bold",
                        setting.isSolo
                          ? "border-bvc-warn bg-bvc-warn text-white"
                          : "border-outline-variant bg-white text-on-surface-variant"
                      )}
                    >
                      S
                    </button>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={setting.volume}
                    aria-label={`Âm lượng ${track.instrumentName}`}
                    onChange={(event) => onVolumeChange(track.id, Number(event.target.value))}
                    className="h-[6px] flex-1 cursor-pointer accent-primary"
                  />
                  <span className="w-[34px] text-right font-mono text-[13px] text-on-surface-variant">
                    {setting.volume}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-on-surface-variant">
            Mặc định: không tắt, không solo, âm lượng 100. Tắt tiếng ưu tiên hơn solo.
          </span>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 cursor-pointer rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface"
          >
            Đặt lại
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
