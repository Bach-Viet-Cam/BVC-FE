import { cn } from "@/shared/utils/cn";

interface MobileScreenProps {
  children: React.ReactNode;
  className?: string;
}

// Mobile-first page frame for the UI/ designs (428px artboards): full width on phones,
// a centered column on tablets/desktop so the same layout scales up.
export function MobileScreen({ children, className }: MobileScreenProps) {
  return (
    <div className="min-h-dvh bg-bvc-surface font-bvc-sans text-bvc-ink">
      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full flex-col bg-white md:max-w-3xl md:border-x md:border-bvc-border lg:max-w-5xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
