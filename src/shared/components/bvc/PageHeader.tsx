import type { ReactNode } from "react";
import { Eyebrow } from "@/shared/components/bvc/SectionIntro";
import { PageTitle } from "@/shared/components/bvc/PageTitle";
import { cn } from "@/shared/utils/cn";

interface PageHeaderProps {
  title: ReactNode;
  // Nhãn ngữ cảnh phía trên tiêu đề
  eyebrow?: ReactNode;
  description?: ReactNode;
  // Nút hành động bên phải tiêu đề
  actions?: ReactNode;
  className?: string;
}

// Đầu trang nội dung (sinh viên, trang dùng chung, quản trị): nhãn, tiêu đề, mô tả và nút hành động
export function PageHeader({ title, eyebrow, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <PageTitle>{title}</PageTitle>
        {description && <p className="m-0 max-w-[640px] text-sm text-bvc-muted md:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}
