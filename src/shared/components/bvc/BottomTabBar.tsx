import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import type { NavItem } from "@/shared/config/navConfig";
import { UserAvatar } from "@/shared/components/bvc/UserAvatar";
import { cn } from "@/shared/utils/cn";

interface BottomTabBarProps {
  tabs: NavItem[];
  displayName: string;
  onOpenMenu?: () => void;
  isMenuOpen?: boolean;
}

function matchesPath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isTabActive(tab: NavItem, pathname: string) {
  return matchesPath(pathname, tab.to) || (tab.activePrefixes ?? []).some((prefix) => matchesPath(pathname, prefix));
}

const tabClass = (isActive: boolean) =>
  cn(
    "group relative flex h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-full transition-[color,transform] duration-150 active:scale-95",
    isActive ? "text-bvc-ink hover:text-bvc-ink" : "text-bvc-muted hover:text-bvc-ink"
  );

interface TabContentProps {
  isActive: boolean;
  label: string;
  icon: ReactNode;
}

function TabContent({ isActive, label, icon }: TabContentProps) {
  return (
    <>
      {isActive && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-linear-to-b from-bvc-accent/[0.16] to-bvc-accent/[0.07] shadow-[inset_0_0_0_1px_rgb(47_122_98/0.14),inset_0_1px_0_rgb(255_255_255/0.85),0_4px_12px_-6px_rgb(47_122_98/0.35)] motion-safe:animate-nav-pop"
        />
      )}
      <span className="relative flex h-6 items-center justify-center">{icon}</span>
      <span
        className={cn(
          "relative max-w-full truncate px-1 text-[11px] leading-none tracking-[-0.01em]",
          isActive ? "font-semibold" : "font-medium"
        )}
      >
        {label}
      </span>
    </>
  );
}

const iconClass = (isActive: boolean) => cn("relative size-[20px] transition-colors", isActive && "text-bvc-accent");

export function BottomTabBar({ tabs, displayName, onOpenMenu, isMenuOpen = false }: BottomTabBarProps) {
  const { pathname } = useLocation();
  const activeTo = tabs.find((tab) => isTabActive(tab, pathname))?.to;
  const isMenuActive = isMenuOpen || (onOpenMenu !== undefined && activeTo === undefined);

  return (
    <nav
      aria-label="Thanh điều hướng"
      data-bvc-bottom-nav=""
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),10px)] md:hidden"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[440px] items-stretch gap-0.5 rounded-full bg-white/70 p-1.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7),inset_0_1px_0_rgb(255_255_255),0_0_0_1px_rgb(18_63_51/0.07),0_14px_34px_-12px_rgb(18_63_51/0.28)] backdrop-blur-2xl backdrop-saturate-[1.8]">
        {tabs.map((tab) => {
          const isActive = !isMenuOpen && tab.to === activeTo;
          const Icon = tab.icon;
          const icon =
            tab.to === "/profile" ? (
              <UserAvatar
                name={displayName}
                className={cn(
                  "relative size-[24px] text-[10px] transition-shadow",
                  isActive ? "ring-2 ring-bvc-accent" : "ring-1 ring-bvc-border-strong"
                )}
              />
            ) : (
              Icon && <Icon aria-hidden className={iconClass(isActive)} strokeWidth={isActive ? 2.2 : 1.8} />
            );
          return (
            <Link key={tab.to} to={tab.to} aria-current={isActive ? "page" : undefined} className={tabClass(isActive)}>
              <TabContent isActive={isActive} label={tab.label} icon={icon} />
            </Link>
          );
        })}
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            className={tabClass(isMenuActive)}
          >
            <TabContent
              isActive={isMenuActive}
              label="Menu"
              icon={<Menu aria-hidden className={iconClass(isMenuActive)} strokeWidth={isMenuActive ? 2.2 : 1.8} />}
            />
          </button>
        )}
      </div>
    </nav>
  );
}
