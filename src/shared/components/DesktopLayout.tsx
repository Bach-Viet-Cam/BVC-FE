import { Outlet } from "react-router-dom";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { NAV_BY_ROLE } from "@/shared/config/navConfig";
import { ROLES } from "@/shared/constants/roles";
import { useAuth } from "@/shared/context/AuthContext";

// Giảng viên và quản trị viên dùng chung khung TeacherShell: sidebar trên desktop, thanh trên + menu cuộn ngang trên mobile
export function DesktopLayout() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <TeacherShell
      className="lg:overflow-hidden"
      navItems={NAV_BY_ROLE[user.role]}
      roleLabel={user.role === ROLES.SYSTEM_ADMIN ? "Quản trị viên" : undefined}
    >
      <Outlet />
    </TeacherShell>
  );
}
