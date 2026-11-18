import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { toast } from "@/shared/components/ui/toast";

interface LlmKeyDeleteDialogProps {
  target: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<string | null>;
}

export function LlmKeyDeleteDialog({ target, onClose, onConfirm }: LlmKeyDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const confirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    const message = await onConfirm(target.id);
    setIsDeleting(false);
    if (message) {
      toast.error(message);
    }
    onClose();
  };
  return (
    <ConfirmDialog
      open={target !== null}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={`Xóa API key “${target?.name ?? ""}”?`}
      description="Key sẽ bị gỡ khỏi hệ thống và không thể hoàn tác."
      confirmLabel="Xác nhận xóa"
      onConfirm={() => void confirm()}
      isLoading={isDeleting}
    />
  );
}
