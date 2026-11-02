import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, MessageSquareText, Music } from "lucide-react";
import artboardImage from "@/assets/image/Artboard 4.png";
import { ScoreRing } from "@/shared/components/bvc/ScoreRing";
import { Waveform } from "@/shared/components/bvc/Waveform";
import { Accent, SectionBadge, SectionHeading } from "@/shared/components/bvc/SectionIntro";
import { LANDING_FEATURES, type LandingFeature } from "@/features/landing/constants/landingContent";
import { cn } from "@/shared/utils/cn";

// Sóng âm minh họa cố định (không ngẫu nhiên) để giao diện không đổi giữa các lần render
const waveBars = (seed: number, color: string) =>
  Array.from({ length: 48 }, (_, index) => ({
    h: 25 + Math.abs(Math.sin((index + seed) * 0.7) * 60) + ((index * seed) % 12),
    color,
  }));

const MOCK_CARD = "w-full max-w-[340px] rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur";

function ScoreVisual() {
  return (
    <div className={MOCK_CARD}>
      <div className="flex items-center gap-4">
        <ScoreRing score={86} size={96} strokeWidth={9} label="Điểm" />
        <div className="flex flex-1 flex-col gap-2.5 text-[12.5px] text-bvc-ink">
          {[
            ["Cao độ", 88],
            ["Nhịp", 84],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="flex justify-between font-medium">
                {label}
                <span>{value}%</span>
              </span>
              <span className="h-1.5 rounded-full bg-bvc-border">
                <span className="block h-full rounded-full bg-bvc-ok" style={{ width: `${value}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 flex gap-2 rounded-xl bg-bvc-soft p-2.5 text-[12px] leading-snug text-bvc-ink">
        <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-bvc-accent" aria-hidden />Ô nhịp 5 đến 7 đánh hơi
        nhanh so với bản mẫu, hãy luyện chậm đoạn này.
      </p>
    </div>
  );
}

function EnsembleVisual() {
  const lanes = [
    { label: "Đàn tranh", color: "var(--color-bvc-bar-strong)", seed: 3 },
    { label: "Sáo trúc", color: "var(--color-bvc-bar-strong)", seed: 7 },
    { label: "Bạn · Đàn bầu", color: "var(--color-bvc-accent)", seed: 11 },
  ];
  return (
    <div className={cn(MOCK_CARD, "flex flex-col gap-3")}>
      {lanes.map((lane) => (
        <div key={lane.label} className="flex flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-bvc-ink">{lane.label}</span>
          <Waveform bars={waveBars(lane.seed, lane.color)} height={30} />
        </div>
      ))}
    </div>
  );
}

function LibraryVisual() {
  const songs = [
    { title: "Lý ngựa ô", meta: "Dân ca Nam Bộ · 3 nhạc cụ", tone: "bg-bvc-ink" },
    { title: "Trống cơm", meta: "Dân ca Bắc Bộ · 2 nhạc cụ", tone: "bg-bvc-accent" },
    { title: "Lưu thủy", meta: "Nhạc tài tử · 4 nhạc cụ", tone: "bg-bvc-accent-text" },
  ];
  return (
    <ul className={cn(MOCK_CARD, "flex flex-col divide-y divide-bvc-border p-2")}>
      {songs.map((song) => (
        <li key={song.title} className="flex items-center gap-3 px-2 py-2.5">
          <span className={cn("flex size-10 items-center justify-center rounded-lg text-white", song.tone)}>
            <Music className="size-4" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-[13.5px] font-semibold text-bvc-ink">{song.title}</span>
            <span className="text-[11.5px] text-bvc-muted">{song.meta}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function RoadmapVisual() {
  const weeks = [
    { week: "Tuần 1", title: "Luyện ngón cơ bản", status: "Đạt", isDone: true },
    { week: "Tuần 2", title: "Lý ngựa ô · bản Cơ bản", status: "Đã nộp", isDone: true },
    { week: "Tuần 3", title: "Trống cơm · hòa tấu", status: "Hạn 15/11", isDone: false },
  ];
  return (
    <ul className={cn(MOCK_CARD, "flex flex-col gap-2")}>
      {weeks.map((item) => (
        <li key={item.week} className="flex items-center gap-3 rounded-xl border border-bvc-border px-3 py-2.5">
          {item.isDone ? (
            <CheckCircle2 className="size-5 shrink-0 text-bvc-ok" aria-hidden />
          ) : (
            <Clock3 className="size-5 shrink-0 text-bvc-warn" aria-hidden />
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] font-semibold tracking-wide text-bvc-muted uppercase">{item.week}</span>
            <span className="truncate text-[13px] font-medium text-bvc-ink">{item.title}</span>
          </span>
          <span className="shrink-0 text-[11.5px] font-medium text-bvc-muted">{item.status}</span>
        </li>
      ))}
    </ul>
  );
}

const VISUALS: Record<LandingFeature["key"], ComponentType> = {
  score: ScoreVisual,
  ensemble: EnsembleVisual,
  library: LibraryVisual,
  roadmap: RoadmapVisual,
};

interface FeatureCardProps {
  feature: LandingFeature;
  delay: number;
}

function FeatureCard({ feature, delay }: FeatureCardProps) {
  const Icon = feature.icon;
  const Visual = VISUALS[feature.key];
  return (
    <motion.li
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-bvc-ink/10 bg-white sm:rounded-[32px]"
    >
      <div className="relative flex h-[300px] items-center justify-center overflow-hidden bg-bvc-surface p-6 sm:h-[360px] sm:p-8">
        <img
          src={artboardImage}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="relative z-10 flex w-full justify-center transition-transform duration-500 group-hover:-translate-y-2">
          <Visual />
        </div>
      </div>
      <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:p-10">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-bvc-accent/20 bg-bvc-accent/5">
          <Icon className="size-5 text-bvc-accent" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-bvc-display text-xl font-semibold tracking-[-0.02em] text-bvc-ink sm:text-2xl">
            {feature.title}
          </h3>
          <p className="text-base leading-relaxed text-bvc-ink/80 sm:text-[17px]">{feature.description}</p>
        </div>
      </div>
    </motion.li>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" aria-labelledby="features-heading" className="w-full scroll-mt-6 bg-white py-20 lg:py-28">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-4 sm:px-6 lg:px-8">
        <SectionBadge>Tính năng chính</SectionBadge>
        <SectionHeading id="features-heading" className="mt-6 max-w-[720px]">
          Mọi thứ để luyện đàn <Accent>mỗi ngày</Accent>
        </SectionHeading>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 max-w-[540px] text-center text-base leading-relaxed text-bvc-ink/80 sm:text-lg"
        >
          Từ chọn bài, thu âm đến xem kết quả và hòa tấu, tất cả nằm trong một ứng dụng.
        </motion.p>

        <ul className="mt-12 grid w-full grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-2">
          {LANDING_FEATURES.map((feature, index) => (
            <FeatureCard key={feature.key} feature={feature} delay={0.15 + index * 0.1} />
          ))}
        </ul>
      </div>
    </section>
  );
}
