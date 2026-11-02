import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Accent, SectionBadge, SectionHeading } from "@/shared/components/bvc/SectionIntro";
import {
  LANDING_BENEFIT_TAGS,
  LANDING_BENEFITS,
  type LandingBenefit,
} from "@/features/landing/constants/landingContent";

const LARGE_SCREEN_QUERY = "(min-width: 1024px)";

function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(() => window.matchMedia?.(LARGE_SCREEN_QUERY).matches ?? false);
  useEffect(() => {
    const media = window.matchMedia(LARGE_SCREEN_QUERY);
    const update = () => setIsLarge(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return isLarge;
}

interface BenefitItemProps {
  benefit: LandingBenefit;
}

function BenefitItem({ benefit }: BenefitItemProps) {
  const Icon = benefit.icon;
  return (
    <motion.li
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex gap-6"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-bvc-border bg-bvc-soft">
        <Icon className="size-5 text-bvc-accent" strokeWidth={2.4} aria-hidden />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-bvc-display text-[20px] font-semibold tracking-[-0.02em] text-bvc-ink md:text-[24px]">
          {benefit.title}
        </span>
        <span className="text-base leading-relaxed text-bvc-ink/80 md:text-[18px]">{benefit.description}</span>
      </span>
    </motion.li>
  );
}

// Lợi ích: cột trái đứng yên, danh sách bên phải trượt theo tiến độ cuộn (màn hình lớn)
export function LandingBenefits() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isLargeScreen = useIsLargeScreen();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const listY = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);

  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      className="w-full scroll-mt-6 bg-white py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1248px] px-6">
        <div className="flex flex-col items-start justify-between gap-16 lg:flex-row lg:gap-12">
          <div className="flex w-full flex-col items-start self-start lg:sticky lg:top-[120px] lg:max-w-[600px]">
            <SectionBadge className="mb-8">Lợi ích</SectionBadge>
            <SectionHeading id="benefits-heading" align="left" className="mb-4">
              Tiến bộ đều đặn <Accent>giữa các buổi</Accent> học trên lớp
            </SectionHeading>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mb-12 max-w-[540px] text-lg leading-relaxed text-bvc-ink/80 md:text-[20px]"
            >
              Ứng dụng không thay giảng viên, mà giúp bạn luyện đúng cách giữa các buổi học và mang kết quả rõ ràng lên
              lớp.
            </motion.p>
            <ul className="flex flex-wrap gap-3">
              {LANDING_BENEFIT_TAGS.map((tag, index) => (
                <motion.li
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.08, ease: "easeOut" }}
                  className="rounded-full border border-bvc-ink/10 px-5 py-2.5 text-base text-bvc-ink transition-colors hover:bg-bvc-soft md:text-[17px]"
                >
                  {tag}
                </motion.li>
              ))}
            </ul>
          </div>

          <div ref={containerRef} className="relative flex w-full flex-1 items-start lg:h-[300vh] lg:max-w-[580px]">
            <div className="flex w-full items-start lg:sticky lg:top-[120px] lg:h-[760px] lg:overflow-hidden">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-24 bg-gradient-to-b from-white via-white/95 to-transparent lg:block"
                aria-hidden
              />
              <div className="relative mr-10 hidden w-0.5 self-stretch bg-bvc-accent/10 lg:block" aria-hidden>
                <motion.div style={{ scaleY: progress, originY: 0 }} className="absolute inset-0 bg-bvc-accent" />
              </div>
              <motion.ul
                style={{ y: isLargeScreen ? listY : 0 }}
                className="flex w-full flex-col gap-10 md:gap-12 lg:gap-14 lg:pt-28 lg:pb-40"
              >
                {LANDING_BENEFITS.map((benefit) => (
                  <BenefitItem key={benefit.title} benefit={benefit} />
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
