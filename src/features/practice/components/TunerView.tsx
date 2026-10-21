import { Check } from "lucide-react";
import { CentsMeter } from "@/features/practice/components/CentsMeter";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { MSG, STRINGS, TUNER_TOLERANCE_CENTS } from "@/features/practice/constants/practiceConstants";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import type { PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useTuner } from "@/features/practice/hooks/useTuner";
import { signed } from "@/features/practice/utils/practiceFormat";
import { centsColor } from "@/features/practice/utils/tunerColor";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";

// Thân + chân màn lên dây, dùng cho trang riêng (điện thoại) và ngăn kéo (laptop).
// Cha phải là cột flex để phần thân cuộn được còn chân luôn ở dưới.
interface TunerViewProps {
  audio: PracticeAudio;
}

export function TunerView({ audio }: TunerViewProps) {
  const { demo } = usePracticeDemo();
  const micDenied = demo.micDenied || audio.micState === "denied";
  const { selected, tuned, live, cents, hz, note, tunedCount, currentString, pickString } = useTuner({
    audio,
    micDenied,
  });

  const color = centsColor(cents, live);

  const advice = !live
    ? "Chạm một dây rồi gảy hoặc kéo dây"
    : Math.abs(cents) <= TUNER_TOLERANCE_CENTS
      ? "Chuẩn — giữ nguyên dây này"
      : cents < 0
        ? `Thấp ${Math.abs(Math.round(cents))}¢ — căng thêm chút nữa`
        : `Cao ${Math.round(cents)}¢ — chùng bớt một chút`;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pb-6 md:px-8">
        <div className="flex flex-col items-center gap-2 pt-3.5">
          <span
            className="text-[76px] leading-none font-extrabold tracking-[-0.04em]"
            style={{ color: live ? "var(--color-bvc-ink)" : "var(--color-bvc-faint)" }}
          >
            {live && note ? note.vn : "--"}
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-base text-bvc-muted">{live && note ? note.en : "--"}</span>
            <span className="text-sm text-bvc-muted">{live && hz !== null ? `${hz.toFixed(1)} Hz` : "--"}</span>
          </div>
        </div>

        <div className="mt-2">
          <CentsMeter cents={cents} live={live} size="large" />
        </div>

        <p
          className="mt-3 rounded-xl border border-bvc-border-strong bg-bvc-surface px-4 py-3 text-center text-sm font-bold md:bg-bvc-panel"
          style={{ color: live ? color : "var(--color-bvc-muted)" }}
        >
          {advice}
        </p>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm font-bold text-bvc-ink">Các dây cần kiểm tra</span>
          <span className="text-[13px] text-bvc-muted">{tunedCount} / 4 dây đã đúng</span>
        </div>

        <div className="mt-2 rounded-bvc-xl border border-bvc-border px-3.5 py-1.5">
          {STRINGS.map((item, index) => {
            const isSelected = index === selected;
            const ok = tuned[index];
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => pickString(index)}
                className={cn(
                  "-mx-3.5 flex min-h-12 w-[calc(100%+28px)] cursor-pointer items-center gap-3 px-3.5 text-left",
                  "border-b border-bvc-surface last:border-b-0",
                  isSelected && "bg-bvc-surface md:bg-bvc-panel"
                )}
              >
                <span className="w-11 shrink-0 text-[13px] text-bvc-muted">{item.code}</span>
                <span className="flex-1 text-sm font-semibold text-bvc-ink">
                  {item.vn} — {item.en}
                </span>
                {ok ? (
                  <span className="flex items-center gap-1 text-[13px] font-bold text-bvc-ok">
                    Đúng
                    <Check size={16} strokeWidth={2.4} />
                  </span>
                ) : isSelected ? (
                  <span className="text-[13px] font-bold" style={{ color }}>
                    {signed(cents)}¢
                  </span>
                ) : (
                  <span className="text-[13px] text-bvc-faint">Chưa đo</span>
                )}
              </button>
            );
          })}
        </div>

        {micDenied && <NoticeBanner className="mt-3" message={MSG.mic} />}

        <p className="mt-3 text-xs leading-normal text-bvc-muted">
          Chạm vào một dây để kiểm tra. Màn hình này chỉ dùng khi chưa ghi âm.
        </p>
      </div>

      <div className="shrink-0 px-3.5 pt-2.5 pb-6 md:border-t md:border-bvc-border-strong md:px-8 md:pt-4">
        <button
          type="button"
          onClick={() => toast.info(`${MSG.refNote} ${currentString.vn} (${currentString.en})`)}
          className="flex min-h-13.5 w-full cursor-pointer items-center justify-center rounded-bvc-lg border border-bvc-border-strong bg-white text-[15px] font-semibold text-bvc-ink md:bg-bvc-panel"
        >
          Phát nốt mẫu
        </button>
      </div>
    </>
  );
}
