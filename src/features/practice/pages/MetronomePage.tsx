import { Pause, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { BPM_MAX, BPM_MIN, SAMPLE, SIGS, SUBS } from "@/features/practice/constants/practiceConstants";
import { useMetronome } from "@/features/practice/hooks/useMetronome";
import type { SubdivisionKey } from "@/features/practice/types/practiceTypes";
import { MobileHeader } from "@/shared/components/bvc/MobileHeader";
import { cn } from "@/shared/utils/cn";

const PRESETS = [
  { label: "Chậm 70%", ratio: 0.7 },
  { label: "Vừa 85%", ratio: 0.85 },
  { label: "Chuẩn 100%", ratio: 1 },
];

const SUB_KEYS: SubdivisionKey[] = ["white", "black", "half", "quarter"];

const SUB_TITLES: Record<SubdivisionKey, string> = {
  white: "Nốt trắng",
  black: "Nốt đen",
  half: "Móc đơn",
  quarter: "Móc kép",
};

const SUB_BEATS: Record<SubdivisionKey, string> = {
  white: "2 phách",
  black: "1 phách",
  half: "1/2 phách",
  quarter: "1/4 phách",
};

const ACCENT_LABEL = { strong: "Mạnh", soft: "Nhẹ", off: "Bỏ" };

export function MetronomePage() {
  const navigate = useNavigate();
  const metronome = useMetronome();
  const { bpm, setBpm, sigIndex, setSig, beats, accents, cycleBeat, currentBeat, playing } = metronome;

  return (
    <PracticeFrame>
      <MobileHeader
        variant="close"
        title="Metronome"
        subtitle={`${SAMPLE.piece} · tốc độ yêu cầu ${SAMPLE.targetBpm} BPM`}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto px-3.5 pb-6">
        <div className="flex items-center justify-center gap-5 pt-2">
          <button
            type="button"
            aria-label="Giảm BPM"
            disabled={bpm <= BPM_MIN}
            onClick={() => setBpm(bpm - 1)}
            className="flex size-13.5 cursor-pointer items-center justify-center rounded-bvc-md border border-bvc-border-strong bg-white text-[22px] text-bvc-ink disabled:cursor-not-allowed disabled:text-bvc-faint"
          >
            −
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[64px] leading-none font-semibold text-bvc-ink">{bpm}</span>
            <span className="text-[13px] tracking-[0.16em] text-bvc-muted">BPM</span>
          </div>
          <button
            type="button"
            aria-label="Tăng BPM"
            disabled={bpm >= BPM_MAX}
            onClick={() => setBpm(bpm + 1)}
            className="flex size-13.5 cursor-pointer items-center justify-center rounded-bvc-md border border-bvc-border-strong bg-white text-[22px] text-bvc-ink disabled:cursor-not-allowed disabled:text-bvc-faint"
          >
            +
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {PRESETS.map((preset) => {
            const value = Math.round(SAMPLE.targetBpm * preset.ratio);
            const active = bpm === value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setBpm(value)}
                className={cn(
                  "min-h-10 flex-1 cursor-pointer rounded-xl border text-[13px]",
                  active
                    ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
                    : "border-bvc-border-strong bg-white text-bvc-ink"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-sm font-bold text-bvc-ink">Phách trong ô nhịp</p>
        <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${beats}, minmax(0, 1fr))` }}>
          {Array.from({ length: beats }).map((_, index) => {
            const accent = accents[index];
            const sounding = playing && index === currentBeat;
            return (
              <button
                key={index}
                type="button"
                onClick={() => cycleBeat(index)}
                className={cn(
                  "flex h-[62px] cursor-pointer items-center justify-center rounded-bvc-lg text-[13px]",
                  accent === "strong" && "bg-bvc-ink font-bold text-white",
                  accent === "soft" && "border border-bvc-border-strong bg-white text-bvc-ink",
                  accent === "off" && "border border-dashed border-bvc-border-strong bg-bvc-surface text-bvc-faint",
                  sounding && "ring-[3px] ring-bvc-accent"
                )}
              >
                {ACCENT_LABEL[accent]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-bvc-muted">Chạm vào từng phách để đổi giữa mạnh, nhẹ và bỏ trống.</p>

        <p className="mt-5 text-sm font-bold text-bvc-ink">Loại nhịp</p>
        <div className="mt-2 flex gap-1 rounded-bvc-md bg-bvc-surface p-0.75">
          {SIGS.map((sig, index) => (
            <button
              key={sig.label}
              type="button"
              onClick={() => setSig(index)}
              className={cn(
                "min-h-10 flex-1 cursor-pointer rounded-[10px] text-sm",
                index === sigIndex ? "bg-bvc-ink font-semibold text-white" : "text-bvc-muted"
              )}
            >
              {sig.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <span className="text-sm font-bold text-bvc-ink">Chia nhỏ phách</span>
          <span className="text-[13px] text-bvc-muted">{SUBS[metronome.subdivision]}</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {SUB_KEYS.map((key) => {
            const active = metronome.subdivision === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => metronome.setSubdivision(key)}
                className={cn(
                  "flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-bvc-lg",
                  active ? "border-2 border-bvc-ink bg-bvc-surface" : "border border-bvc-border bg-white"
                )}
              >
                <span className="text-[13px] font-bold text-bvc-ink">{SUB_TITLES[key]}</span>
                <span className="text-[11px] text-bvc-muted">{SUB_BEATS[key]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-pressed={metronome.vibrate}
          onClick={metronome.toggleVibrate}
          className="mt-5 flex min-h-12 w-full cursor-pointer items-center justify-between rounded-bvc-md border border-bvc-border-strong bg-white px-3.5 text-sm font-semibold text-bvc-ink"
        >
          Rung nhẹ theo phách mạnh
          <span
            className={cn(
              "relative block h-[26px] w-11 shrink-0 rounded-[13px]",
              metronome.vibrate ? "bg-bvc-accent" : "bg-bvc-border-strong"
            )}
          >
            <span
              className="absolute top-[3px] size-5 rounded-full bg-white transition-[left]"
              style={{ left: metronome.vibrate ? 21 : 3 }}
            />
          </span>
        </button>

        <p className="mt-3 text-xs leading-normal text-bvc-muted">
          Chỉ để luyện thử. Tốc độ ở đây không làm đổi tốc độ yêu cầu của bài tập.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 px-3.5 pt-2.5 pb-6">
        <button
          type="button"
          onClick={metronome.tapTempo}
          className="flex min-h-13.5 flex-1 cursor-pointer items-center justify-center rounded-bvc-lg border border-bvc-border-strong bg-white text-[15px] font-semibold text-bvc-ink"
        >
          Gõ theo nhịp
        </button>
        <button
          type="button"
          aria-label={playing ? "Dừng metronome" : "Bắt đầu đếm nhịp"}
          onClick={metronome.togglePlaying}
          className="flex size-18 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-accent text-white"
        >
          {playing ? (
            <Pause size={26} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={26} fill="currentColor" strokeWidth={0} />
          )}
        </button>
      </div>
    </PracticeFrame>
  );
}
