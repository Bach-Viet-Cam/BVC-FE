import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { FormSurfaceContext } from "@/shared/components/bvc/formSurfaceContext";
import { LeaveConfirmDialog } from "@/shared/components/bvc/LeaveConfirmDialog";
import { useLeaveGuard } from "@/shared/hooks/useLeaveGuard";
import { cn } from "@/shared/utils/cn";

interface FormDialogProps {
  open: boolean;
  // Đóng thật sự (đã qua bước hỏi lại nếu form đang nhập dở)
  onClose: () => void;
  title: string;
  description?: ReactNode;
  isDirty?: boolean;
  // Form có bản nháp: hộp hỏi lại có thêm nút "Lưu bản nháp"
  onSaveDraft?: () => Promise<boolean>;
  size?: "md" | "lg" | "xl";
  // Hàm nhận requestClose để nút Hủy trong form cũng đi qua bước hỏi lại
  children: ReactNode | ((requestClose: () => void) => ReactNode);
}

const SIZE_CLASSES = {
  md: "max-w-[560px]",
  lg: "max-w-[720px]",
  xl: "max-w-[1040px]",
};

// Modal chứa form tạo hoặc sửa. Khi đang nhập dở mà bấm X, Esc, bấm ra ngoài hay nút Hủy thì hỏi lại.
export function FormDialog({
  open,
  onClose,
  title,
  description,
  isDirty = false,
  onSaveDraft,
  size = "md",
  children,
}: FormDialogProps) {
  const { guard, confirmProps } = useLeaveGuard({ isDirty: open && isDirty, onSaveDraft });
  const requestClose = () => guard(onClose);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
      <BvcDialogPopup className={cn("gap-0 p-0 sm:p-0", SIZE_CLASSES[size])}>
        <FormSurfaceContext.Provider value="dialog">
          <div className="flex items-start gap-4 px-6 pt-6 pb-2 sm:px-[30px] sm:pt-7">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-bvc-ink">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm leading-relaxed text-bvc-muted">{description}</DialogDescription>
              )}
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={requestClose}
              className="-mt-1 -mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {typeof children === "function" ? children(requestClose) : children}
        </FormSurfaceContext.Provider>
        <LeaveConfirmDialog {...confirmProps} />
      </BvcDialogPopup>
    </Dialog>
  );
}
