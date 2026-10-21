import type { ReactNode } from "react";
import { Dialog, DialogClose, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Hủy",
  onConfirm,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BvcDialogPopup className="max-w-[420px]">
        <DialogTitle className="text-xl font-extrabold tracking-[-0.02em] text-bvc-ink">{title}</DialogTitle>
        {description && (
          <DialogDescription className="text-sm leading-relaxed text-bvc-muted">{description}</DialogDescription>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <DialogClose className={actionButtonClass("secondary")}>{cancelLabel}</DialogClose>
          <ActionButton onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </ActionButton>
        </div>
      </BvcDialogPopup>
    </Dialog>
  );
}
