import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import bannerImage from "@/assets/image/Artboard 3.png";
import studentImage from "@/assets/image/student.png";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { useLandingAccount } from "@/features/landing/hooks/useLandingAccount";
import { Accent, SectionBadge, SectionHeading } from "@/shared/components/bvc/SectionIntro";
import { LANDING_STEPS } from "@/features/landing/constants/landingContent";
import { cn } from "@/shared/utils/cn";

// Quy trình luyện 4 bước: chọn tab để xem chi tiết từng bước
export function LandingSteps() {
  const [activeId, setActiveId] = useState(LANDING_STEPS[0].id);
  const active = LANDING_STEPS.find((step) => step.id === activeId) ?? LANDING_STEPS[0];
  const ActiveIcon = active.icon;
  const { homePath } = useLandingAccount();

  return (
    <section id="steps" aria-labelledby="steps-heading" className="w-full scroll-mt-6 bg-bvc-soft py-20 lg:py-28">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-12 px-4 md:px-6 lg:gap-14">
        <div className="flex flex-col items-start gap-6">
          <SectionBadge>Cách luyện</SectionBadge>
          <SectionHeading id="steps-heading" align="left" className="max-w-[600px]">
            Luyện một bài trong <Accent>4 bước</Accent> đơn giản
          </SectionHeading>
        </div>

        <div className="flex flex-col gap-6">
          <motion.div
            role="tablist"
            aria-label="Các bước luyện tập"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex w-full snap-x items-center gap-2 overflow-x-auto rounded-2xl bg-white p-3 shadow-[0_1px_20px_0_rgba(18,63,51,0.05)] [scrollbar-width:none] lg:justify-between lg:px-5"
          >
            {LANDING_STEPS.map((step) => {
              const isActive = step.id === activeId;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="step-panel"
                  onClick={() => setActiveId(step.id)}
                  className={cn(
                    "flex shrink-0 cursor-pointer snap-start items-center gap-3 rounded-xl px-4 py-2.5 transition-colors sm:px-6",
                    isActive ? "bg-bvc-accent/8" : "hover:bg-bvc-soft"
                  )}
                >
                  <Icon
                    className={cn("size-5", isActive ? "text-bvc-accent" : "text-bvc-ink/60")}
                    strokeWidth={2.4}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-base whitespace-nowrap sm:text-[17px]",
                      isActive ? "font-semibold text-bvc-accent" : "text-bvc-ink/60"
                    )}
                  >
                    {step.id}. {step.label}
                  </span>
                </button>
              );
            })}
          </motion.div>

          <div
            id="step-panel"
            role="tabpanel"
            className="flex w-full flex-col items-center justify-between gap-12 overflow-hidden rounded-[32px] border border-bvc-ink/5 bg-white p-6 shadow-[0_0_20px_0_rgba(18,63,51,0.05)] lg:flex-row lg:gap-8 lg:py-4 lg:pr-4 lg:pl-16"
          >
            <div className="flex w-full flex-col items-start lg:max-w-[520px]">
              <motion.span
                key={`icon-${activeId}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-4 flex size-16 items-center justify-center rounded-xl border border-bvc-ink/10 bg-white shadow-sm"
              >
                <ActiveIcon className="size-8 text-bvc-accent" strokeWidth={2.2} aria-hidden />
              </motion.span>
              <motion.h3
                key={`heading-${activeId}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-4 font-bvc-display text-[28px] leading-tight font-semibold tracking-[-0.025em] text-bvc-ink lg:text-[34px]"
              >
                {active.heading}
              </motion.h3>
              <motion.p
                key={`text-${activeId}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-8 text-base leading-relaxed text-bvc-ink/80 lg:text-[18px]"
              >
                {active.description}
              </motion.p>
              <ul className="mb-10 flex flex-col gap-3">
                {active.points.map((point, index) => (
                  <motion.li
                    key={`${activeId}-${point}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bvc-accent/10">
                      <Check className="size-3 text-bvc-accent" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="text-base font-medium text-bvc-ink">{point}</span>
                  </motion.li>
                ))}
              </ul>
              <PillLink to={homePath} label="Bắt đầu luyện tập" />
            </div>

            <div className="relative flex h-[380px] w-full items-center justify-center overflow-hidden rounded-[24px] sm:h-[460px] lg:h-[540px] lg:w-[520px] lg:shrink-0">
              <img src={bannerImage} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-bvc-ink/25" aria-hidden />
              <AnimatePresence mode="wait">
                <motion.figure
                  key={`visual-${activeId}`}
                  initial={{ scale: 0.92, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.05, opacity: 0, y: -30 }}
                  transition={{ duration: 0.45 }}
                  className="relative z-10 w-[82%] max-w-[400px]"
                >
                  <img
                    src={studentImage}
                    alt="Sinh viên luyện đàn nguyệt trong lớp"
                    className="aspect-[4/5] w-full rounded-[22px] object-cover shadow-2xl ring-4 ring-white/70"
                  />
                  <figcaption className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-semibold whitespace-nowrap text-bvc-ink shadow-xl">
                    <ActiveIcon className="size-4 text-bvc-accent" aria-hidden />
                    Bước {active.id}: {active.label}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
