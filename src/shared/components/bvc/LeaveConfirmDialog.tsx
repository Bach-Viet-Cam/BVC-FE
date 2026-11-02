import { Dialog, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";

interface LeaveConfirmDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
  // Form có bản nháp: thêm nút lưu bản nháp rồi thoát
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}

// Hỏi lại khi thoát form đang nhập dở (đóng modal, bấm Hủy, quay lại)
export function LeaveConfirmDialog({ open, onStay, onLeave, onSaveDraft, isSavingDraft }: LeaveConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isSavingDraft && onStay()}>
      <BvcDialogPopup className="max-w-[520px] shadow-xl">
        <DialogTitle className="text-[20px] font-semibold tracking-[-0.01em] text-bvc-ink">
          Thoát khi chưa lưu?
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-bvc-muted">
          {onSaveDraft
            ? "Nội dung bạn đang nhập chưa được lưu. Lưu bản nháp để làm tiếp sau, hoặc thoát và bỏ nội dung này."
            : "Nội dung bạn đang nhập chưa được lưu và sẽ mất nếu thoát."}
        </DialogDescription>
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <ActionButton variant="ghost" onClick={onStay} disabled={isSavingDraft}>
            Tiếp tục nhập
          </ActionButton>
          {onSaveDraft ? (
            <>
              <ActionButton variant="secondary" onClick={onLeave} disabled={isSavingDraft}>
                Thoát không lưu
              </ActionButton>
              <ActionButton onClick={onSaveDraft} isLoading={isSavingDraft}>
                Lưu bản nháp
              </ActionButton>
            </>
          ) : (
            <ActionButton onClick={onLeave}>Thoát</ActionButton>
          )}
        </div>
      </BvcDialogPopup>
    </Dialog>
  );
}
