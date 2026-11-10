import { useState } from "react";
import { motion } from "framer-motion";
import { INSTALL_GUIDES, INSTALL_PLATFORMS, detectInstallPlatform } from "@/features/landing/constants/installGuide";
import { cn } from "@/shared/utils/cn";

export function InstallGuideSteps() {
  const [platform, setPlatform] = useState(() => detectInstallPlatform(navigator.userAgent, navigator.maxTouchPoints));
  const [cardDelay, setCardDelay] = useState(0.8);
  const guide = INSTALL_GUIDES[platform];
  const isPhone = guide.layout === "phone";

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        role="tablist"
        aria-label="Thiết bị"
        className="flex w-full gap-2 overflow-x-auto rounded-2xl bg-white p-3 shadow-[0_1px_20px_0_rgba(18,63,51,0.05)] [scrollbar-width:none] sm:w-fit"
      >
        {INSTALL_PLATFORMS.map((value) => {
          const isActive = value === platform;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="install-panel"
              onClick={() => {
                setPlatform(value);
                setCardDelay(0);
              }}
              className={cn(
                "shrink-0 cursor-pointer rounded-xl px-4 py-2.5 text-base whitespace-nowrap transition-colors sm:px-6 sm:text-[17px]",
                isActive ? "bg-bvc-accent/8 font-semibold text-bvc-accent" : "text-bvc-ink/60 hover:bg-bvc-soft"
              )}
            >
              {INSTALL_GUIDES[value].label}
            </button>
          );
        })}
      </motion.div>

      <div id="install-panel" role="tabpanel" aria-label={guide.label}>
        <ol
          aria-label={`Các bước cài trên ${guide.label}`}
          className={cn("grid gap-5", isPhone ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}
        >
          {guide.steps.map((step, index) => (
            <motion.li
              key={`${platform}-${index}`}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: cardDelay + 0.08 * index, duration: 0.5, ease: [0.21, 0.45, 0.32, 0.9] }}
              className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-bvc-ink/5 bg-white shadow-[0_0_20px_0_rgba(18,63,51,0.05)]"
            >
              <div className="flex items-start gap-3 p-5">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bvc-ink text-sm font-semibold text-white"
                >
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-relaxed text-bvc-ink">
                  <span className="sr-only">Bước {index + 1}: </span>
                  {step.text}
                </p>
              </div>
              <div
                className={cn(
                  "mt-auto flex justify-center border-t border-bvc-border bg-bvc-soft",
                  isPhone ? "p-4" : "min-h-[200px] items-center p-5"
                )}
              >
                <img
                  src={step.image}
                  alt={step.alt}
                  loading="lazy"
                  className={cn(
                    "h-auto rounded-bvc-md shadow-sm",
                    isPhone ? "max-h-[420px] w-auto max-w-full object-contain" : "max-w-full"
                  )}
                />
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
