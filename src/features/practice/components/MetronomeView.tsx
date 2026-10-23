import { Pause, Play } from "lucide-react";
import { InfoHint } from "@/features/practice/components/InfoHint";
import { NoteIcon } from "@/features/practice/components/NoteIcon";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { BPM_MAX, BPM_MIN, PRACTICE_DEFAULTS, SIGS, SUBS } from "@/features/practice/constants/practiceConstants";
import { useMetronome } from "@/features/practice/hooks/useMetronome";
import type { SubdivisionKey } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

const PRESETS = [
  { label: "Chậm 70%", ratio: 0.7 },
  { label: "Vừa 85%", ratio: 0.85 },
  { label: "Chuẩn 100%", ratio: 1 },
];

const SUB_KEYS: SubdivisionKey[] = ["white", "black", "half", "quarter"];

function isSubdivisionKey(value: unknown): value is SubdivisionKey {
  return SUB_KEYS.some((key) => key === value);
}

const ACCENT_LABEL = { strong: "Mạnh", soft: "Nhẹ", off: "Bỏ" };

// Thân + chân màn metronome, dùng cho trang riêng (điện thoại) và ngăn kéo (laptop).
// Cha phải là cột flex để phần thân cuộn được còn chân luôn ở dưới.
export function MetronomeView() {
  const metronome = useMetronome();
  const { bpm, setBpm, sigIndex, setSig, beats, accents, cycleBeat, currentBeat, playing } = metronome;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-3.5 pb-6 md:px-8">
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
            <span className="text-[64px] leading-none font-semibold text-bvc-ink md:text-[68px]">{bpm}</span>
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
            const value = Math.round(PRACTICE_DEFAULTS.targetBpm * preset.ratio);
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
                  accent === "off" &&
                    "border border-dashed border-bvc-border-strong bg-bvc-surface text-bvc-faint md:bg-bvc-panel",
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
        <div className="mt-2 flex gap-1 rounded-bvc-md bg-bvc-surface p-0.75 md:bg-bvc-panel">
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

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-bvc-ink">Chia nhỏ phách</span>
          <Select
            value={metronome.subdivision}
            onValueChange={(value) => {
              if (isSubdivisionKey(value)) metronome.setSubdivision(value);
            }}
          >
            <SelectTrigger
              aria-label="Chia nhỏ phách"
              className="min-h-10 w-24 rounded-bvc-md border-bvc-border-strong"
            >
              <SelectValue>
                {(value: SubdivisionKey) => <NoteIcon kind={value} className="size-7 text-bvc-ink" />}
              </SelectValue>
            </SelectTrigger>
            <SelectPopup positionerClassName="z-[90]">
              {SUB_KEYS.map((key) => (
                <SelectItem key={key} value={key} aria-label={SUBS[key]}>
                  <NoteIcon kind={key} className="size-7" />
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>

        <div className="mt-5 flex items-center gap-1">
          <button
            type="button"
            aria-pressed={metronome.vibrate}
            onClick={metronome.toggleVibrate}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-between rounded-bvc-md border border-bvc-border-strong bg-white px-3.5 text-sm font-semibold text-bvc-ink"
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
          <InfoHint label="Giải thích Rung nhẹ theo phách mạnh">
            <p>Chỉ để luyện thử. Tốc độ ở đây không làm đổi tốc độ yêu cầu của bài tập.</p>
            <p className="mt-2">Chỉ hoạt động trên điện thoại hỗ trợ rung (chủ yếu Android).</p>
          </InfoHint>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 px-3.5 pt-2.5 pb-6 md:border-t md:border-bvc-border-strong md:px-8 md:pt-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={metronome.tapTempo}
            className="flex min-h-11 cursor-pointer items-center justify-center rounded-bvc-md border border-bvc-border-strong bg-white px-4 text-[13px] font-semibold text-bvc-ink"
          >
            Gõ theo nhịp
          </button>
          <InfoHint label="Giải thích nút Gõ theo nhịp">
            Gõ liên tục theo nhịp bạn muốn. Hệ thống tính BPM từ các lần gõ gần nhất rồi cập nhật tốc độ. Nút này không
            phát tiếng.
          </InfoHint>
        </div>
        <div className="flex flex-1 items-center gap-1">
          <button
            type="button"
            aria-label={playing ? "Dừng metronome" : "Bắt đầu đếm nhịp"}
            onClick={metronome.togglePlaying}
            className="flex min-h-16 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-bvc-lg bg-bvc-accent text-base font-bold text-white"
          >
            {playing ? (
              <Pause size={26} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={26} fill="currentColor" strokeWidth={0} />
            )}
            {playing ? "Dừng" : "Bắt đầu"}
          </button>
          <InfoHint label="Giải thích nút Bắt đầu">
            Bật hoặc tắt tiếng gõ nhịp theo tốc độ BPM đang chọn. Đổi BPM, loại nhịp hoặc phách mạnh nhẹ khi đang chạy
            sẽ nghe thay đổi ngay.
          </InfoHint>
        </div>
      </div>
    </>
  );
}
