import { cn } from "@/shared/utils/cn";

export type ClassTabKey = "members" | "roadmap" | "assignments" | "progress";

interface ClassTabsProps {
  activeTab: ClassTabKey;
  onChange: (tab: ClassTabKey) => void;
}

const TABS: Array<{ key: ClassTabKey; label: string }> = [
  { key: "members", label: "Thành viên" },
  { key: "roadmap", label: "Lộ trình" },
  { key: "assignments", label: "Bài tập" },
  { key: "progress", label: "Tiến độ" },
];

export function ClassTabs({ activeTab, onChange }: ClassTabsProps) {
  return (
    <nav
      aria-label="Tab lớp"
      role="tablist"
      className="flex shrink-0 justify-center gap-[22px] no-scrollbar overflow-x-auto overflow-y-hidden border-b border-bvc-border px-[18px]"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex min-h-[44px] cursor-pointer items-center whitespace-nowrap text-[14px]",
              isActive ? "border-b-2 border-bvc-ink font-bold text-bvc-ink" : "text-bvc-muted"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
