import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";

interface CategoryDeleteDialogProps {
  target: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
}

export function CategoryDeleteDialog({ target, onClose, onConfirm }: CategoryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    await onConfirm(target.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPopup className="max-w-[460px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
        <div className="flex items-start gap-3.5">
          <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-error">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 pr-6">
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
              Xóa danh mục “{target?.name}”?
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-bvc-muted">
              Chỉ có thể xóa khi danh mục không còn danh mục con trực thuộc và không gắn với bài nhạc nào. Thao tác này không thể hoàn tác.
            </DialogDescription>
          </div>
        </div>
        <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />

        <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-bvc-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={confirm}
            className="min-h-[40px] cursor-pointer rounded-[12px] bg-bvc-error px-4.5 text-[13.5px] font-bold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
