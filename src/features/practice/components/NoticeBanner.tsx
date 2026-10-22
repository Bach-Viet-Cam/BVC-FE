import { cn } from "@/shared/utils/cn";

interface NoticeBannerProps {
  message: string;
  className?: string;
}

export function NoticeBanner({ message, className }: NoticeBannerProps) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-bvc-md border border-bvc-warn/50 bg-bvc-accent-tint px-3 py-2.5",
        "text-[12.5px] leading-[1.5] text-bvc-accent-text",
        className
      )}
    >
      {message}
    </div>
  );
}
