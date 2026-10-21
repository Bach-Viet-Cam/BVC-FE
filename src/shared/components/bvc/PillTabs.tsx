import { cn } from "@/shared/utils/cn";

interface PillTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface PillTabsProps<T extends string> {
  label: string;
  tabs: PillTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function PillTabs<T extends string>({ label, tabs, value, onChange, className }: PillTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-2 overflow-x-auto [scrollbar-width:none]", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-[7px] rounded-full px-4 text-[13.5px] whitespace-nowrap",
              isActive
                ? "bg-bvc-ink font-semibold text-white"
                : "border border-bvc-border-strong text-bvc-ink hover:bg-bvc-surface"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("font-bvc-mono text-xs", isActive ? "opacity-80" : "text-bvc-muted")}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
