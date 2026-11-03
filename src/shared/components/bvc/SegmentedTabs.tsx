import { useEffect, useRef, type ComponentType } from "react";
import { cn } from "@/shared/utils/cn";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export interface SegmentedTabOption<T> {
  value: T;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  count?: number;
}

export interface SegmentedTabsProps<T> {
  label: string;
  tabs: readonly SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  tabClassName?: string;
  collapseBreakpoint?: "sm" | "md" | "lg" | "xl" | false;
}

export function SegmentedTabs<T>({
  label,
  tabs,
  value,
  onChange,
  className,
  tabClassName,
  collapseBreakpoint = false,
}: SegmentedTabsProps<T>) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof activeRef.current?.scrollIntoView === "function") {
      activeRef.current.scrollIntoView({
        inline: "nearest",
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [value]);

  const desktopClass =
    collapseBreakpoint === "sm"
      ? "hidden sm:inline-flex"
      : collapseBreakpoint === "md"
        ? "hidden md:inline-flex"
        : collapseBreakpoint === "lg"
          ? "hidden lg:inline-flex"
          : collapseBreakpoint === "xl"
            ? "hidden xl:inline-flex"
            : "inline-flex";

  const mobileClass =
    collapseBreakpoint === "sm"
      ? "inline-flex sm:hidden"
      : collapseBreakpoint === "md"
        ? "inline-flex md:hidden"
        : collapseBreakpoint === "lg"
          ? "inline-flex lg:hidden"
          : collapseBreakpoint === "xl"
            ? "inline-flex xl:hidden"
            : "hidden";

  return (
    <>
      {collapseBreakpoint && (
        <div className={cn("w-full sm:w-auto items-center", mobileClass)}>
          <Select
            value={String(value ?? "")}
            onValueChange={(val) => {
              const matched = tabs.find((t) => String(t.value ?? "") === val);
              if (matched) onChange(matched.value);
            }}
          >
            <SelectTrigger
              aria-label={label}
              className="h-[38px] w-full sm:w-auto min-w-[160px] rounded-[10px] border-bvc-border-strong bg-white px-3 text-[13px] font-semibold text-bvc-ink shadow-2xs hover:border-bvc-ink"
            >
              <SelectValue>
                {(val) => {
                  const current = tabs.find((t) => String(t.value ?? "") === val);
                  const Icon = current?.icon;
                  return (
                    <span className="flex items-center gap-2 truncate">
                      {Icon && <Icon size={14} className="text-bvc-ink shrink-0" />}
                      <span className="truncate">{current?.label ?? label}</span>
                      {typeof current?.count === "number" && (
                        <span className="rounded-full bg-bvc-surface px-1.5 py-0.2 text-[11px] font-bold text-bvc-ink">
                          {current.count}
                        </span>
                      )}
                    </span>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectPopup positionerClassName="z-50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={String(tab.value ?? "all")} value={String(tab.value ?? "")}>
                    <span className="flex items-center gap-2">
                      {Icon && <Icon size={14} className="text-bvc-muted shrink-0" />}
                      <span>{tab.label}</span>
                      {typeof tab.count === "number" && (
                        <span className="ml-auto text-[11px] font-bold text-bvc-muted">
                          ({tab.count})
                        </span>
                      )}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectPopup>
          </Select>
        </div>
      )}

      <div
        role="tablist"
        aria-label={label}
        className={cn(
          "w-fit max-w-full shrink-0 self-start flex-nowrap items-center overflow-x-auto rounded-[12px] border border-bvc-border/80 bg-bvc-surface/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          desktopClass,
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          const Icon = tab.icon;

          return (
            <button
              key={String(tab.value ?? "all")}
              ref={isActive ? activeRef : null}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none",
                isActive
                  ? "bg-white text-bvc-ink shadow-xs"
                  : "text-bvc-muted hover:text-bvc-ink",
                tabClassName
              )}
            >
              {Icon && (
                <Icon
                  size={14}
                  className={cn(
                    "shrink-0",
                    isActive ? "text-bvc-ink" : "text-bvc-faint"
                  )}
                />
              )}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                    isActive
                      ? "bg-bvc-surface text-bvc-ink"
                      : "bg-black/5 text-bvc-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
