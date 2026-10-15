import { ActionButton } from "@/features/classes/components/ActionButton";
import { Dialog, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// MSG-02 confirmation popup ("{action} {object}? {consequence}"), styled after the UI/ cards.
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && !isConfirming && onCancel()}>
      <DialogPopup className="w-[calc(100%-36px)] max-w-[400px] gap-[14px] rounded-[20px] border-bvc-border bg-white p-[18px] font-bvc-sans text-bvc-ink">
        <DialogTitle className="text-[17px] font-extrabold text-bvc-ink">{title}</DialogTitle>
        <DialogDescription className="text-[13.5px] leading-[1.5] text-bvc-muted">{description}</DialogDescription>
        <div className="flex gap-[10px]">
          <ActionButton size="lg" onClick={onCancel} disabled={isConfirming}>
            Hủy
          </ActionButton>
          <ActionButton size="lg" variant="primary" onClick={onConfirm} disabled={isConfirming}>
            {confirmLabel}
          </ActionButton>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
