import type { ReactNode } from "react";
import { useFormSurface } from "@/shared/components/bvc/formSurfaceContext";
import { cn } from "@/shared/utils/cn";

interface FormLayoutProps {
  children: ReactNode;
  className?: string;
}

const BODY_CLASSES = {
  page: "flex grow flex-col gap-4 px-[18px] pt-1.5 pb-[18px] lg:m-[22px_32px] lg:max-w-[720px] lg:grow-0 lg:rounded-bvc-xl lg:border lg:border-bvc-border lg:p-5",
  dialog: "flex flex-col gap-4 px-6 pt-3 pb-6 sm:px-[30px]",
};

const FOOTER_CLASSES = {
  page: "mt-auto px-[18px] pt-3 pb-6 lg:justify-end lg:px-8 lg:py-4 lg:[&>*]:min-w-[140px] lg:[&>*]:flex-none",
  dialog: "px-6 py-4 sm:justify-end sm:px-[30px] sm:[&>*]:min-w-[120px] sm:[&>*]:flex-none",
};

// Vùng các ô nhập của form; tự đổi khung theo nơi đặt form (trang hoặc modal)
export function FormBody({ children, className }: FormLayoutProps) {
  return <div className={cn(BODY_CLASSES[useFormSurface()], className)}>{children}</div>;
}

// Hàng nút cuối form, luôn dính đáy để không phải cuộn mới thấy nút lưu
export function FormFooter({ children, className }: FormLayoutProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex shrink-0 gap-2.5 border-t border-bvc-border bg-white [&>*]:flex-1",
        FOOTER_CLASSES[useFormSurface()],
        className
      )}
    >
      {children}
    </div>
  );
}
