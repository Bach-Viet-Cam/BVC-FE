import { useEffect } from "react";
import { Pause, Play } from "lucide-react";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { useReferenceAudio } from "@/features/practice/hooks/useReferenceAudio";

interface SegmentReferencePlayerProps {
  url: string;
  start: number;
  end: number;
}

// "Nghe mẫu đoạn": phát bản mẫu từ đầu đoạn và tự dừng ở cuối đoạn
export function SegmentReferencePlayer({ url, start, end }: SegmentReferencePlayerProps) {
  const player = useReferenceAudio(url);
  const { playing, playPos, togglePlay, seek } = player;

  useEffect(() => {
    if (playing && playPos >= end) togglePlay();
  }, [playing, playPos, end, togglePlay]);

  function handleToggle() {
    if (!playing) seek(start);
    togglePlay();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-bvc-border-strong px-4 text-sm font-medium text-bvc-ink"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        {playing ? "Dừng nghe mẫu" : "Nghe mẫu đoạn"}
      </button>
      {player.error && <span className="text-[12.5px] text-bvc-accent-text">{MSG.referencePlaybackFailed}</span>}
    </div>
  );
}
