import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { type NotificationItem } from "@/features/platform/types/notificationTypes";

interface NotificationDeleteDialogProps {
  target: NotificationItem | null;
  onClose: () => void;
  onConfirm: (item: NotificationItem) => Promise<boolean>;
}

export function NotificationDeleteDialog({ target, onClose, onConfirm }: NotificationDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    await onConfirm(target);
    setIsDeleting(false);
    onClose();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPopup className="max-w-[460px] rounded-[18px] border-bvc-border p-6">
        <DialogTitle className="text-[17px] font-bold text-bvc-ink">Xóa thông báo “{target?.title}”?</DialogTitle>
        <DialogDescription className="text-[13px] leading-relaxed text-bvc-muted">
          Chỉ xóa được thông báo nháp hoặc đang hẹn giờ. Thao tác này không thể hoàn tác.
        </DialogDescription>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={confirm}>
            Xóa
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
