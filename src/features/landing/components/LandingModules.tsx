import { Fragment } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import logoImage from "@/assets/image/logo.png";
import { Accent, SectionBadge, SectionHeading } from "@/shared/components/bvc/SectionIntro";
import {
  LANDING_MODULES_LEFT,
  LANDING_MODULES_RIGHT,
  type LandingModule,
} from "@/features/landing/constants/landingContent";
import { cn } from "@/shared/utils/cn";

// Hệ tọa độ của hình nối trên màn hình lớn: tâm logo ở giữa, 4 thẻ mỗi bên cách nhau 96px
const VIEW = { width: 1240, height: 368, centerX: 620, centerY: 184, radius: 84, cardInnerX: 280 };
const CARD_CENTERS_Y = [40, 136, 232, 328];
const LEFT_ANGLES = [225, 195, 165, 135];
const RIGHT_ANGLES = [-45, -15, 15, 45];

function anchorAt(angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: VIEW.centerX + VIEW.radius * Math.cos(radians),
    y: VIEW.centerY + VIEW.radius * Math.sin(radians),
  };
}

function connectorPath(angle: number, index: number, side: "left" | "right") {
  const start = anchorAt(angle);
  const direction = side === "left" ? -1 : 1;
  const endX = side === "left" ? VIEW.cardInnerX : VIEW.width - VIEW.cardInnerX;
  return `M ${start.x} ${start.y} Q ${start.x + direction * 150} ${start.y} ${endX} ${CARD_CENTERS_Y[index]}`;
}

interface ModuleCardProps {
  module: LandingModule;
  index: number;
  side: "left" | "right";
}

function ModuleCard({ module, index, side }: ModuleCardProps) {
  const Icon = module.icon;
  return (
    <motion.li
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
      className={cn(
        "group flex h-[72px] w-[260px] items-center gap-3 rounded-[18px] border border-black/[0.03] bg-white p-3 shadow-[0_4px_20px_rgba(18,63,51,0.04)] transition-shadow hover:shadow-[0_12px_40px_rgba(18,63,51,0.08)]",
        "min-[1288px]:absolute min-[1288px]:h-[80px] min-[1288px]:w-[280px] min-[1288px]:gap-4 min-[1288px]:p-4",
        // Mỗi thẻ cách nhau 96px theo trục dọc, khớp với CARD_CENTERS_Y
        ["min-[1288px]:top-0", "min-[1288px]:top-[96px]", "min-[1288px]:top-[192px]", "min-[1288px]:top-[288px]"][index]
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-bvc-accent/8 text-bvc-accent transition-transform group-hover:scale-110">
        <Icon className="size-6" strokeWidth={2.2} aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold text-bvc-ink min-[1288px]:text-[16px]">{module.name}</span>
        <span className="text-[13px] text-bvc-ink/50">{module.description}</span>
      </span>
    </motion.li>
  );
}

// Các công cụ của ứng dụng xoay quanh logo, nối bằng đường chấm có điểm sáng chạy dọc
export function LandingModules() {
  return (
    <section aria-labelledby="modules-heading" className="w-full overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1288px] px-6">
        <div className="mb-12 flex flex-col items-center text-center md:mb-20">
          <SectionBadge className="mb-6">Công cụ</SectionBadge>
          <SectionHeading id="modules-heading" className="mb-5 max-w-2xl">
            Mọi công cụ luyện tập ở <Accent>một nơi</Accent>
          </SectionHeading>
          <p className="max-w-[600px] text-base leading-relaxed text-bvc-ink/80 md:text-lg">
            Từ lên dây, giữ nhịp đến thu âm, chấm điểm và hòa tấu, các công cụ dùng chung một tài khoản và một lịch sử
            luyện tập.
          </p>
        </div>

        <div className="relative mx-auto flex w-full max-w-[1240px] items-center justify-center min-[1288px]:h-[368px]">
          <svg
            viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
            className="pointer-events-none absolute inset-0 hidden size-full min-[1288px]:block"
            aria-hidden
          >
            <defs>
              <linearGradient id="module-line-left" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2f7a62" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#2f7a62" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="module-line-right" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#2f7a62" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#2f7a62" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            {(["left", "right"] as const).map((side) =>
              (side === "left" ? LEFT_ANGLES : RIGHT_ANGLES).map((angle, index) => {
                const path = connectorPath(angle, index, side);
                return (
                  <Fragment key={`${side}-${angle}`}>
                    <path
                      d={path}
                      stroke={`url(#module-line-${side})`}
                      fill="none"
                      strokeWidth="1.8"
                      strokeDasharray="4 4"
                    />
                    <circle r="3.5" fill="#2f7a62">
                      <animateMotion
                        dur="3.5s"
                        repeatCount="indefinite"
                        path={path}
                        begin={`${index * 0.4 + (side === "right" ? 0.2 : 0)}s`}
                      />
                    </circle>
                  </Fragment>
                );
              })
            )}
            {[...LEFT_ANGLES, ...RIGHT_ANGLES].map((angle, index) => {
              const anchor = anchorAt(angle);
              return (
                <motion.circle
                  key={`anchor-${angle}`}
                  cx={anchor.x}
                  cy={anchor.y}
                  r="5"
                  fill="#2f7a62"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
                />
              );
            })}
          </svg>

          <div className="relative z-10 flex w-full flex-col items-center min-[1288px]:block min-[1288px]:h-full">
            <ul className="mb-8 flex flex-wrap justify-center gap-4 min-[1288px]:absolute min-[1288px]:top-0 min-[1288px]:left-0 min-[1288px]:mb-0 min-[1288px]:h-full min-[1288px]:w-[280px]">
              {LANDING_MODULES_LEFT.map((module, index) => (
                <ModuleCard key={module.name} module={module} index={index} side="left" />
              ))}
            </ul>

            <div className="flex items-center justify-center py-10 min-[1288px]:absolute min-[1288px]:top-1/2 min-[1288px]:left-1/2 min-[1288px]:-translate-x-1/2 min-[1288px]:-translate-y-1/2 min-[1288px]:py-0">
              <div className="relative flex size-[110px] items-center justify-center min-[1288px]:size-[124px]">
                <motion.div
                  animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 -m-8 rounded-full bg-bvc-accent/15 min-[1288px]:-m-14"
                  aria-hidden
                />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="relative z-10 flex size-full items-center justify-center rounded-full bg-bvc-ink shadow-[0_12px_48px_rgba(47,122,98,0.3)] ring-8 ring-white"
                >
                  <img src={logoImage} alt="Bách Việt Cầm" className="w-[84%] object-contain" />
                </motion.div>
              </div>
            </div>

            <ul className="mt-8 flex flex-wrap justify-center gap-4 min-[1288px]:absolute min-[1288px]:top-0 min-[1288px]:right-0 min-[1288px]:mt-0 min-[1288px]:h-full min-[1288px]:w-[280px]">
              {LANDING_MODULES_RIGHT.map((module, index) => (
                <ModuleCard key={module.name} module={module} index={index} side="right" />
              ))}
            </ul>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-12 flex w-fit items-center gap-3 rounded-full border border-bvc-accent/15 bg-white px-5 py-2.5 text-[14px] shadow-[0_4px_24px_rgba(47,122,98,0.05)] md:mt-20 md:text-[15px]"
        >
          <LogIn className="size-5 text-bvc-accent" aria-hidden />
          <span>
            <span className="font-semibold text-bvc-accent">Đăng nhập nhanh bằng Google.</span>{" "}
            <span className="text-bvc-ink/50">Thư viện xem được cả khi chưa đăng nhập.</span>
          </span>
        </motion.p>
      </div>
    </section>
  );
}
