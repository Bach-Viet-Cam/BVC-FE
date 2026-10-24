import type { ReactNode } from "react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { TeacherShell } from "@/shared/components/bvc/TeacherShell";
import { useViewerRole } from "@/shared/hooks/useViewerRole";

interface LibraryShellProps {
  children: ReactNode;
  className?: string;
}

// Giảng viên xem thư viện, chi tiết bài hát và bản nhạc giống sinh viên nhưng vẫn giữ sidebar của mình
export function LibraryShell({ children, className }: LibraryShellProps) {
  const role = useViewerRole();
  if (role === "teacher") return <TeacherShell className={className}>{children}</TeacherShell>;
  return <StudentShell className={className}>{children}</StudentShell>;
}
