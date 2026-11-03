import type { ReactNode } from "react";
import bannerImage from "@/assets/image/Artboard 3.png";
import { PageTitle } from "@/shared/components/bvc/PageTitle";
import { Eyebrow } from "@/shared/components/bvc/SectionIntro";
import { cn } from "@/shared/utils/cn";

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  // Nút hành động bên phải tiêu đề (dùng PillLink / ActionButton)
  actions?: ReactNode;
  // Nội dung nằm trong dải hero, dưới tiêu đề (vd. ô tìm kiếm, số liệu nhanh)
  children?: ReactNode;
  className?: string;
}

// Dải đầu trang theo phong cách trang giới thiệu: ảnh BVC làm nền, phủ xanh đậm, chữ trắng.
export function PageHero({ eyebrow, title, description, actions, children, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-bvc-xl bg-bvc-ink text-white md:rounded-[28px]",
        className
      )}
    >
      <img src={bannerImage} alt="" aria-hidden className="absolute inset-0 -z-10 size-full object-cover" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-bvc-ink/95 via-bvc-ink/80 to-bvc-ink/55"
        aria-hidden
      />
      <div className="flex flex-col gap-5 p-5 sm:p-7 md:p-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-2.5">
            {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
            <PageTitle tone="dark">{title}</PageTitle>
            {description && (
              <p className="max-w-[620px] text-[14.5px] leading-relaxed text-white/80 md:text-[16px]">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
