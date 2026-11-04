import type { ReactNode } from "react";
import { PageHeader } from "@/shared/components/bvc/PageHeader";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { NAV_BY_ROLE } from "@/shared/config/navConfig";
import { useAuth } from "@/shared/context/AuthContext";
import { useViewerRole } from "@/shared/hooks/useViewerRole";
import { cn } from "@/shared/utils/cn";

interface RoleShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  // Bề rộng tối đa của vùng nội dung trên web
  contentClassName?: string;
  hideHeader?: boolean;
}

// Trang dùng chung cho mọi vai trò (thông báo, hồ sơ, trợ giúp): giữ đúng menu của người đang xem
export function RoleShell({ title, subtitle, actions, children, contentClassName, hideHeader = false }: RoleShellProps) {
  const { user } = useAuth();
  const role = useViewerRole();

  const content = (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-10 md:pt-8",
        contentClassName
      )}
    >
      {!hideHeader && <PageHeader title={title} description={subtitle} actions={actions} />}
      {children}
    </div>
  );

  if (user && (role === "teacher" || role === "admin")) {
    return (
      <TeacherShell navItems={NAV_BY_ROLE[user.role]} roleLabel={role === "admin" ? "Quản trị viên" : undefined}>
        {content}
      </TeacherShell>
    );
  }

  return <StudentShell>{content}</StudentShell>;
}
