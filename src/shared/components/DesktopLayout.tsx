import { Outlet } from "react-router-dom";
import { DesktopSidebar } from "@/shared/components/bvc/DesktopSidebar";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { NAV_BY_ROLE } from "@/shared/config/navConfig";
import { ROLE_LABELS, ROLES } from "@/shared/constants/roles";
import { useAuth } from "@/shared/context/AuthContext";
import { getInitials } from "@/shared/utils/getInitials";

const ROLE_LABEL_BY_NUMBER: Record<number, string> = ROLE_LABELS;

export function DesktopLayout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  // Giảng viên dùng chung TeacherShell với các trang M02 để chỉ có một menu
  if (user.role === ROLES.TEACHER) {
    return (
      <TeacherShell className="lg:overflow-hidden">
        <Outlet />
      </TeacherShell>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_BY_ROLE[user.role] ?? []}
        user={{
          initials: getInitials(user.username),
          name: user.username,
          role: ROLE_LABEL_BY_NUMBER[user.role] ?? "",
        }}
        onLogout={logout}
      />
      <Outlet />
    </div>
  );
}
