import { Music2 } from "lucide-react";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useReferenceAudio } from "@/features/practice/hooks/useReferenceAudio";
import { PlaybackBar } from "@/shared/components/bvc/PlaybackBar";

interface ReferenceAudioPlayerProps {
  url: string;
  isFallback: boolean;
}

// Nghe bản thu mẫu của bản nhạc trước khi ghi. Chỉ hiện khi chưa ghi: bắt đầu đếm nhịp thì khối này
// bị gỡ khỏi màn hình nên tiếng mẫu dừng, không lọt vào micro.
export function ReferenceAudioPlayer({ url, isFallback }: ReferenceAudioPlayerProps) {
  const audio = useReferenceAudio(url);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-bvc-border bg-bvc-soft p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-bvc-ink">
          <Music2 className="size-4" aria-hidden />
          Bản thu mẫu
        </span>
        <span className="text-[12px] text-bvc-muted">
          {isFallback ? "Bản thu của bản chính · nghe trước khi ghi" : "Nghe trước khi ghi"}
        </span>
      </div>
      {/* PlaybackBar co giãn theo hàng ngang (flex-1 basis-80); bọc trong hàng để không bị kéo cao trong cột */}
      <div className="flex">
        <PlaybackBar
          peaks={audio.peaks}
          playing={audio.playing}
          playPos={audio.playPos}
          takeLen={audio.duration}
          volume={audio.volume}
          muted={audio.muted}
          rate={audio.rate}
          onTogglePlay={audio.togglePlay}
          onSeek={audio.seek}
          onVolumeChange={audio.setVolume}
          onToggleMute={audio.toggleMute}
          onRateChange={audio.setRate}
        />
      </div>
      {audio.error && <p className="text-[12.5px] text-bvc-error">{MSG.referencePlaybackFailed}</p>}
    </div>
  );
}
