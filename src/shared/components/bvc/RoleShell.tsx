import type { ReactNode } from "react";
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
}

// Trang dùng chung cho mọi vai trò (thông báo, hồ sơ, trợ giúp): giữ đúng menu của người đang xem
export function RoleShell({ title, subtitle, actions, children, contentClassName }: RoleShellProps) {
  const { user } = useAuth();
  const role = useViewerRole();

  const content = (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-10 md:pt-8",
        contentClassName
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="m-0 text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[34px] md:tracking-[-0.03em]">
            {title}
          </h1>
          {subtitle && <p className="m-0 text-sm text-bvc-muted md:text-[15px]">{subtitle}</p>}
        </div>
        {actions}
      </div>
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
