import { useState } from "react";
import { SkipBack, SkipForward, Pause, Play, Volume2, VolumeX, Share2 } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";

const WAVEFORM_HEIGHTS = [
  0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.4,
  0.5, 0.7, 0.6, 0.8, 0.5, 0.7, 0.9, 1.0,
  0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.5, 0.6,
  0.8, 0.7, 0.6, 0.5, 0.4, 0.6, 0.7, 0.5,
];

const PLAYHEAD_INDEX = 16;

interface MemberTrack {
  name: string;
  instrument: string;
  submitted: boolean;
}

const MEMBER_TRACKS: MemberTrack[] = [
  { name: "Hồng Nhung", instrument: "Đàn tranh", submitted: true },
  { name: "Đức Anh", instrument: "Đàn bầu", submitted: true },
  { name: "Phú Quang", instrument: "Đàn nhị", submitted: true },
  { name: "Kim Chi", instrument: "Tỳ bà", submitted: false },
  { name: "Thái Bình", instrument: "Sáo trúc", submitted: true },
];

const MINI_WAVEFORM_HEIGHTS = [0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 1.0, 0.6, 0.5, 0.8, 0.7, 0.4, 0.9, 0.6, 0.5, 0.7];

export function EnsemblePlaybackPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [mutedTracks, setMutedTracks] = useState<boolean[]>([false, false, false, false, false]);

  const toggleMute = (index: number) => {
    setMutedTracks((prev) => prev.map((m, i) => (i === index ? !m : m)));
  };

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Ghép bè — Nhóm 3" variant="back" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {/* Master waveform section */}
          <div className="px-[14px] pt-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Bản ghép tổng
            </div>

            {/* Waveform */}
            <div className="relative mt-2">
              <div className="flex items-center gap-[2px] h-[48px]">
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className={`w-[2px] rounded-[1px] ${
                      i === 7 || i === 15 || i === 20 || i === 24
                        ? "bg-bvc-accent"
                        : "bg-bvc-bar-strong"
                    }`}
                    style={{ height: `${h * 48}px` }}
                  />
                ))}
              </div>
              {/* Playhead */}
              <div
                className="absolute top-[-2px] w-[1.5px] h-[52px] bg-bvc-ink"
                style={{
                  left: `${PLAYHEAD_INDEX * (2 + 2)}px`,
                }}
              />
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between text-[11px] font-mono text-bvc-muted mt-1">
              <span>0:00</span>
              <span>0:47</span>
              <span>1:34</span>
              <span>2:21</span>
              <span>3:08</span>
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-4 my-3">
              <button
                type="button"
                className="size-[44px] rounded-full border border-bvc-border flex items-center justify-center"
                aria-label="Tua lại"
              >
                <SkipBack size={18} className="text-bvc-ink" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((v) => !v)}
                className="size-[56px] rounded-full bg-bvc-ink flex items-center justify-center"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <Pause size={22} className="text-white" />
                ) : (
                  <Play size={22} className="text-white" />
                )}
              </button>

              <button
                type="button"
                className="size-[44px] rounded-full border border-bvc-border flex items-center justify-center"
                aria-label="Tua tới"
              >
                <SkipForward size={18} className="text-bvc-ink" />
              </button>
            </div>
          </div>

          {/* Member tracks */}
          <div className="text-[13px] font-bold px-[14px] mt-2 text-bvc-ink">
            Bè thành viên
          </div>

          {MEMBER_TRACKS.map((track, i) => (
            <div
              key={track.name}
              className="flex items-center gap-3 px-[14px] py-[10px] border-b border-bvc-line"
            >
              {/* Name + instrument */}
              <div className="flex flex-col gap-[1px] w-[88px] shrink-0">
                <span className="text-[13px] font-semibold text-bvc-ink truncate">
                  {track.name}
                </span>
                <span className="text-[11px] text-bvc-muted truncate">
                  {track.instrument}
                </span>
              </div>

              {/* Mini waveform */}
              <div className="flex-1 flex items-center gap-[1.5px] h-[28px] relative">
                {track.submitted ? (
                  MINI_WAVEFORM_HEIGHTS.map((h, j) => (
                    <div
                      key={j}
                      className="w-[2px] rounded-[1px] bg-bvc-bar-strong"
                      style={{ height: `${h * 28}px` }}
                    />
                  ))
                ) : (
                  <>
                    {MINI_WAVEFORM_HEIGHTS.map((_, j) => (
                      <div
                        key={j}
                        className="w-[2px] rounded-[1px] bg-bvc-line"
                        style={{ height: "14px" }}
                      />
                    ))}
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] text-bvc-faint">
                      chưa nộp
                    </span>
                  </>
                )}
              </div>

              {/* Mute button — only for submitted tracks */}
              {track.submitted ? (
                <button
                  type="button"
                  onClick={() => toggleMute(i)}
                  className="size-[32px] rounded-[10px] border border-bvc-border flex items-center justify-center shrink-0"
                  aria-label={mutedTracks[i] ? "Bật tiếng" : "Tắt tiếng"}
                >
                  {mutedTracks[i] ? (
                    <VolumeX size={14} className="text-bvc-muted" />
                  ) : (
                    <Volume2 size={14} className="text-bvc-ink" />
                  )}
                </button>
              ) : (
                <div className="size-[32px] shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Sticky bottom bar */}
        <div className="shrink-0 px-[14px] pb-5 pt-3 border-t border-bvc-line">
          <button
            type="button"
            className="h-[54px] w-full rounded-[16px] bg-bvc-ink flex items-center justify-center gap-2 font-bold text-[16px] text-white"
          >
            <Share2 size={18} className="text-white" />
            Chia sẻ cho giảng viên
          </button>
        </div>
      </div>
    </div>
  );
}
