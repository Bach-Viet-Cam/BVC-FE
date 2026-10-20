import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Home, Music2 } from "lucide-react";
import { STUDENT_TABS } from "@/shared/config/navConfig";
import { cn } from "@/shared/utils/cn";

const TAB_ICONS = { home: Home, practice: Music2, library: BookOpen, assignments: ClipboardList };

export function StudentTabBar() {
  return (
    <nav className="flex shrink-0 border-t border-bvc-border bg-white pb-[6px]">
      {STUDENT_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.icon];
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-[3px] text-[11.5px]",
                isActive ? "font-bold text-bvc-accent-text" : "text-bvc-muted"
              )
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
