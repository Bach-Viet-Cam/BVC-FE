import { Dialog, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

interface CreateAccountDialogProps {
  open: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Email Google chưa có trong hệ thống: hỏi người dùng có muốn tạo tài khoản học sinh mới không
export function CreateAccountDialog({ open, isLoading, onConfirm, onCancel }: CreateAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isLoading) onCancel();
      }}
    >
      <BvcDialogPopup>
        <DialogTitle className="text-2xl font-extrabold tracking-[-0.02em] text-bvc-ink">
          Tạo tài khoản mới?
        </DialogTitle>
        <DialogDescription className="text-[15px] leading-relaxed text-bvc-muted">
          Email này chưa có tài khoản trong hệ thống. Bạn có muốn tạo tài khoản mới với vai trò học sinh không?
        </DialogDescription>
        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={actionButtonClass("primary", "lg", "w-full")}
          >
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={actionButtonClass("secondary", "lg", "w-full")}
          >
            Để sau
          </button>
        </div>
      </BvcDialogPopup>
    </Dialog>
  );
}
