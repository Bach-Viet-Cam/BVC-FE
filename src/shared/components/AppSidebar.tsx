import { NavLink } from "react-router-dom";
import { LayoutDashboard, type LucideIcon } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { ROLES, type Role } from "@/shared/constants/roles";
import { cn } from "@/shared/utils/cn";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Tổng quan",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.STUDENT, ROLES.TEACHER, ROLES.SYSTEM_ADMIN],
  },
];

export function AppSidebar() {
  const { hasAnyRole } = useAuth();
  const items = NAV_ITEMS.filter((item) => hasAnyRole(item.roles));

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-outline-variant/30 bg-surface-container-lowest p-3">
      <div className="px-2 py-3 text-lg font-bold text-primary">BachVietCam</div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors",
              "hover:bg-primary/5 hover:text-primary",
              isActive && "bg-primary/10 text-primary"
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
